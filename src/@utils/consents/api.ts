import axios, { AxiosResponse } from 'axios'

import { ZodType } from 'zod'
import { ConsentsApiRoutes as Routes } from './routes'
import {
  ConsentSchema,
  ConsentsListSchema,
  UserConsentsDataSchema
} from './schemas'
import {
  Consent,
  ConsentDirection,
  ConsentList,
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
export const validateWithSchema =
  <T>(schema: ZodType<T>) =>
  (response: AxiosResponse) =>
    validate<T>(response, schema)

export const getUserConsentsDirection = async (
  address: string,
  direction: ConsentDirection,
  signal?: AbortSignal
): Promise<ConsentList> =>
  API.get(Routes.UserConsents(address), {
    params: {
      direction
    },
    signal
  }).then(validateWithSchema(ConsentsListSchema))

export const getUserConsents = async (
  address: string,
  signal?: AbortSignal
): Promise<UserConsentsData> =>
  API.get(Routes.UserConsentsAmount(address), {
    signal
  }).then((result) => {
    if (result.data) {
      return validateWithSchema(UserConsentsDataSchema)(result)
    }
    return {} as UserConsentsData
  })

export const createConsent = async (
  address: string,
  datasetDid: string,
  algorithmDid: string,
  request: PossibleRequests,
  reason?: string
): Promise<void> =>
  API.post(Routes.UserConsents(address), {
    datasetDid,
    algorithmDid,
    request,
    reason
  })

export const deleteConsent = async (
  consentId: number,
  signal?: AbortSignal
): Promise<void> =>
  API.delete(Routes.Consents(String(consentId)), {
    signal
  })

export const createConsentResponse = async (
  consentId: number,
  reason: string,
  permitted: PossibleRequests
): Promise<Consent> =>
  API.post(Routes.ConsentsResponse(String(consentId)), {
    reason,
    permitted
  }).then(validateWithSchema(ConsentSchema))

export const deleteConsentResponse = async (consentId: number): Promise<void> =>
  await API.delete(Routes.ConsentsResponse(String(consentId)))

export const getHealth = async (): Promise<boolean> =>
  API.get(Routes.ConsentsHealth)
