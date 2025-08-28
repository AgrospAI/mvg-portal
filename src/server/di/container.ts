'use server'
import dotenv from 'dotenv'

import { Container } from 'inversify'
import ICredentialsService from '../credentials/credentials'
import { RedisCredentialsService } from '../credentials/impl/redis-credentials'
dotenv.config()

const container = new Container()

container
  .bind<ICredentialsService>('Credentials')
  .to(RedisCredentialsService)
  .inSingletonScope()

export { container }
