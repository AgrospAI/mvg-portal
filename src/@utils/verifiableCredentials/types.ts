import * as z from 'zod'
import * as schemas from './schemas'

export type PontusVerifiableCredential = z.infer<
  typeof schemas.PontusVerifiableCredentialSchema
>

export type PontusVerifiableCredentialArray = z.infer<
  typeof schemas.PontusVerifiableCredentialArraySchema
>
