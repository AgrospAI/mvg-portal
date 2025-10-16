import {
  GaiaXCredentialSubjectType,
  GaiaXVerifiableCredential,
  GaiaXVerifiablePresentation
} from './types'

export const filterVerifiableCredentialType = (
  verifiablePresentations: GaiaXVerifiablePresentation,
  target: GaiaXCredentialSubjectType
): Array<GaiaXVerifiableCredential> => {
  if (
    !verifiablePresentations ||
    !verifiablePresentations.verifiableCredential
  ) {
    return []
  }

  return verifiablePresentations.verifiableCredential.filter(
    ({ credentialSubject }) => credentialSubject.type === target
  )
}
