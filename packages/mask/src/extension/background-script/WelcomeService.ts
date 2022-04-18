import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import './legacy'
export * from '../../../background/services/backup'
assertEnvironment(Environment.ManifestBackground)
