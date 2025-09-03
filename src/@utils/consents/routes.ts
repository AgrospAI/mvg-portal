export const ConsentsApiRoutes = {
  ConsentsResponse: (id: string) => `consents-response/${id}`,
  Consents: (id: string) => `consents/${id}`,
  ConsentsHealth: 'consents/health',
  UserConsentsAmount: (address: string) => `user/${address}/consents-amount`,
  UserConsents: (address: string) => `user/${address}/consents`
}
