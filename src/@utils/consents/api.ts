import axios, { AxiosResponse } from 'axios'

import { toast } from 'react-toastify'
import { ZodType } from 'zod'
import { ConsentsApiRoutes as Routes } from './routes'
import {
  ConsentResponseSchema,
  ConsentsListSchema,
  UserConsentsDataSchema
} from './schemas'
import {
  ConsentDirection,
  ConsentList,
  ConsentResponse,
  PossibleRequests,
  UserConsentsData
} from './types'

const API = axios.create({
  baseURL: '/api',
  timeout: 2000
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message =
      error?.response?.data?.message || 'An unexpected error occurred'

    if (status >= 400) {
      toast.error(`Error ${status}: ${message}`)
    } else {
      toast.error('Network or server error')
    }

    return Promise.reject(error)
  }
)

const validate = <T>({ data }: AxiosResponse, schema: ZodType<T>): T => {
  const result = schema.safeParse(data)

  if (!result.success) {
    toast.error('Invalid response data')
    console.error('Error validating', result.error)
    throw new Error('Validation failed', result.error)
  }

  return result.data
}

export const getUserConsentsDirection = async (
  address: string,
  direction: ConsentDirection
): Promise<ConsentList> => {
  return validate(
    await API.get(Routes.GET_CONSENTS_AMOUNT_DIRECTION, {
      params: {
        address,
        direction
      }
    }),
    ConsentsListSchema
  )
}

export const getUserConsents = async (
  address: string
): Promise<UserConsentsData> => {
  return validate(
    await API.get(Routes.GET_CONSENTS_AMOUNT, { params: { address } }),
    UserConsentsDataSchema
  )
}

export const createConsent = async (
  address: string,
  datasetDid: string,
  algorithmDid: string,
  request: PossibleRequests,
  reason?: string
): Promise<void> =>
  API.post(Routes.CREATE_CONSENT, {
    address,
    datasetDid,
    algorithmDid,
    request,
    reason
  })

export const deleteConsent = async (consentId: number): Promise<void> =>
  API.delete(Routes.DELETE_CONSENT, { data: { consentId } })

export const createConsentResponse = async (
  consentId: number,
  reason: string,
  permitted: PossibleRequests
): Promise<ConsentResponse> => {
  return validate(
    await API.post(Routes.CREATE_CONSENT_RESPONSE, {
      consentId,
      reason,
      permitted
    }),
    ConsentResponseSchema
  )
}

export const deleteConsentResponse = async (consentId: number): Promise<void> =>
  API.delete(Routes.DELETE_CONSENT_RESPONSE, {
    data: { consentId }
  })
