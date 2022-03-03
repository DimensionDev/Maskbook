import { LDO_PAIRS } from '../constants'
import type { SavingsProtocol } from '../types'
import { LidoProtocol } from './LDOProtocol'
// import AAVEProtocol from './AAVEProtocol'

export const SavingsProtocols: SavingsProtocol[] = [...LDO_PAIRS.map((pair) => new LidoProtocol(pair))]
