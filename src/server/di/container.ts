'use server'
import dotenv from 'dotenv'

import { Container } from 'inversify'
import IConsentsService from '../consents/consents'
import IConsentResponseService from '../consents/consents-response'
import IConsentsHealthService from '../consents/health'
import { ConsentsService } from '../consents/impl/consent'
import { ConsentResponseService } from '../consents/impl/consent-response'
import { ConsentsHealthService } from '../consents/impl/health'
import ICredentialsService from '../credentials/credentials'
import { RedisCredentialsService } from '../credentials/impl/redis-credentials'
dotenv.config()

const container = new Container()

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
