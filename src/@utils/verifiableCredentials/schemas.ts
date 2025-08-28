import * as z from 'zod'

export const PontusVerifiableCredentialSchema = z
  .object({
    'Participant (Gaia-X Loire)': z.string(),
    'Public Address': z.string(),
    Status: z.string(),
    'Gaia-X Participant 22.10 Credential': z.url()
  })
  .transform((object) => ({
    participant: object['Participant (Gaia-X Loire)'],
    address: object['Public Address'],
    status: object.Status,
    credentialUrl: object['Gaia-X Participant 22.10 Credential']
  }))

export const PontusVerifiableCredentialArraySchema =
  PontusVerifiableCredentialSchema.array()
