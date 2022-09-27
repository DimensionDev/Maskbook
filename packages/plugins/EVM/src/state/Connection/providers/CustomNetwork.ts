import type { EVM_Provider } from '../types.js'
import { BaseProvider } from './Base.js'

export class CustomNetworkProvider extends BaseProvider implements EVM_Provider {}
