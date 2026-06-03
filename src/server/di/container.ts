import { Container } from 'inversify'
import ICredentialsService from '../credentials/credentials'
import { LocalCredentialsService } from '../credentials/impl/local-credentials'
import IEnvironmentService from '../env/env'
import { EnvironmentService } from '../env/impl/env'

const container = new Container()

container
  .bind<IEnvironmentService>('Env')
  .to(EnvironmentService)
  .inSingletonScope()

container
  .bind<ICredentialsService>('Credentials')
  .to(LocalCredentialsService)
  .inSingletonScope()

export { container }
