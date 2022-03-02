import type { SavingsProtocol } from '../types'
import LidoProtocol from './LDOProtocol'
import AAVEProtocol from './AAVEProtocol'

export const SavingsProtocols: SavingsProtocol[] = [LidoProtocol, ...AAVEProtocols]
