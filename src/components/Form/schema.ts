import { z } from 'zod'

const requiredString = (message: string = 'Por favor, selecciona una opción') =>
  z.preprocess(
    (val) => (val === null || val === undefined ? '' : val),
    z
      .string()
      .min(1, { message })
      .refine((val) => val !== 'Seleccione...', { message })
  )

const requiredNumber = (message: string = 'Debes indicar una cantidad') =>
  z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return 0
    const parsed = Number(val)
    return isNaN(parsed) ? 0 : parsed
  }, z.number().min(1, { message }))

export const questionnaireSchema = z.object({
  companyProfile: requiredString('Selecciona el perfil'),
  employeeCount: requiredNumber('Indica el nº de trabajadores'),
  employeeAvgAge: requiredString('Selecciona la edad media'),
  clientCount: requiredNumber('Indica el nº de clientes'),
  providerCount: requiredNumber('Indica el nº de proveedores'),
  annualRevenue: requiredString('Selecciona la facturación'),
  outsourcingLevel: requiredString('Selecciona el nivel de externalización'),

  remoteWorkPolicy: requiredString('Selecciona una opción'),
  secureRemoteAccess: requiredString('Selecciona una opción'),
  twoFactorAuth: requiredString('Selecciona una opción'),
  infrastructureType: requiredString('Selecciona el tipo de infraestructura'),

  digitizedProcessesPct: requiredString('Selecciona el porcentaje'),
  erpSystem: requiredString('Indica tu ERP'),
  crmSystem: requiredString('Indica tu CRM'),
  aiUsage: requiredString('Selecciona opción de IA'),

  dbType: requiredString('Selecciona el tipo de BBDD'),
  reportingTools: requiredString('Selecciona la herramienta de reporte'),

  advancedDigitalSkills: requiredString('Selecciona porcentaje'),
  ms365Usage: requiredString('Selecciona Sí/No'),
  collabTools: requiredString('Selecciona una opción'),
  digitalTraining: requiredString('Selecciona una opción'),
  securityTraining: requiredString('Selecciona una opción'),
  ftfeTraining: requiredString('Selecciona Sí/No'),
  phishingTests: requiredString('Selecciona una opción'),

  internetPresence: requiredString('Selecciona una opción'),
  socialMediaManagement: requiredString('Selecciona una opción'),
  digitalMarketing: requiredString('Selecciona una opción'),
  analyticsUsage: requiredString('Selecciona una opción'),

  ecommerce: requiredString('Selecciona una opción'),
  digitalRevenue: requiredString('Selecciona un rango'),
  commChannelHabitual: requiredString('Selecciona el canal habitual'),
  commChannelPreferred: requiredString('Selecciona el canal preferente'),

  antivirusName: requiredString('Indica el nombre del antivirus'),
  antivirusPct: requiredString('Selecciona el porcentaje'),
  securityPatches: requiredString('Selecciona una opción'),
  networkControls: requiredString('Selecciona una opción'),

  userManagementProcess: requiredString('Selecciona una opción'),
  rolePrivileges: requiredString('Selecciona una opción'),

  incidentPlan: requiredString('Selecciona una opción'),
  bcpDrpPlan: requiredString('Selecciona una opción'),

  gdprCompliance: requiredString('Selecciona una opción'),
  legalTraining: requiredString('Selecciona una opción'),

  priorityArea: requiredString('Por favor, selecciona un área prioritaria')
})

export type FormValues = z.infer<typeof questionnaireSchema>
