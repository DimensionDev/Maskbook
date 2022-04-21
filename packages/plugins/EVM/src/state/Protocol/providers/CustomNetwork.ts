import type { EVM_Provider } from '../types'
import { BaseProvider } from './Base'

export class CustomNetworkProvider extends BaseProvider implements EVM_Provider {}
