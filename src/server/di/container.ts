'use server'

import { Container } from 'inversify'
import IConsentsService from '../consents/consents'
import IConsentResponseService from '../consents/consents-response'
import IConsentsHealthService from '../consents/health'
import { ConsentsService } from '../consents/impl/consent'
import { ConsentResponseService } from '../consents/impl/consent-response'
import { ConsentsHealthService } from '../consents/impl/health'
import ICredentialsService from '../credentials/credentials'
import { RedisCredentialsService } from '../credentials/impl/redis-credentials'
import IEnvironmentService from '../env/env'
import { EnvironmentService } from '../env/impl/env'

const container = new Container()

container
  .bind<IEnvironmentService>('Env')
  .to(EnvironmentService)
  .inSingletonScope()

container
  .bind<ICredentialsService>('Credentials')
  .to(RedisCredentialsService)
  .inSingletonScope()

container
  .bind<IConsentsHealthService>('ConsentHealth')
  .to(ConsentsHealthService)
  .inSingletonScope()

container
  .bind<IConsentsService>('Consents')
  .to(ConsentsService)
  .inSingletonScope()

container
  .bind<IConsentResponseService>('ConsentResponse')
  .to(ConsentResponseService)
  .inSingletonScope()

export { container }
