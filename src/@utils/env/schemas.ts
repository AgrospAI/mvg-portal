import * as z from 'zod'

export const EnvironmentSchema = z.object({
  CONSENTS_API_URL: z.url(),
  CREDENTIALS_REDIS_URL: z.url(),
  CREDENTIALS_REDIS_USERNAME: z.string().optional(),
  CREDENTIALS_REDIS_PASSWORD: z.string().optional()
})
