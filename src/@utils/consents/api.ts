import axios, { AxiosResponse } from 'axios'

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

const validate = <T>({ data }: AxiosResponse, schema: ZodType<T>): T => {
  const result = schema.safeParse(data)

  if (!result.success) {
    console.error('Error validating', result.error)
    throw new Error('Invalid response data from API', { cause: result.error })
  }

  return result.data
}

// HoF to ease the validation writing
const validateWithSchema =
  <T>(schema: ZodType<T>) =>
  (response: AxiosResponse) =>
    validate<T>(response, schema)

export const getUserConsentsDirection = async (
  address: string,
  direction: ConsentDirection,
  signal?: AbortSignal
): Promise<ConsentList> =>
  API.get(Routes.GET_CONSENTS_AMOUNT_DIRECTION, {
    params: {
      address,
      direction
    },
    signal
  }).then(validateWithSchema(ConsentsListSchema))

export const getUserConsents = async (
  address: string,
  signal?: AbortSignal
): Promise<UserConsentsData> =>
  API.get(Routes.GET_CONSENTS_AMOUNT, {
    params: { address },
    signal
  }).then(validateWithSchema(UserConsentsDataSchema))

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

export const deleteConsent = async (
  consentId: number,
  signal?: AbortSignal
): Promise<void> =>
  API.delete(Routes.DELETE_CONSENT, { data: { consentId }, signal })

export const createConsentResponse = async (
  consentId: number,
  reason: string,
  permitted: PossibleRequests
): Promise<ConsentResponse> =>
  API.post(Routes.CREATE_CONSENT_RESPONSE, {
    consentId,
    reason,
    permitted
  }).then(validateWithSchema(ConsentResponseSchema))

export const deleteConsentResponse = async (
  consentId: number,
  signal?: AbortSignal
): Promise<void> =>
  API.delete(Routes.DELETE_CONSENT_RESPONSE, {
    data: { consentId },
    signal
  })

export const getHealth = async (): Promise<boolean> =>
  API.get(Routes.HEALTHCHECK)
