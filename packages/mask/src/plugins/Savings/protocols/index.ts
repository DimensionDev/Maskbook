import { LDO_PAIRS } from '../constants'
import { LidoProtocol } from './LDOProtocol'

export const SavingsProtocols = [...LDO_PAIRS.map((pair) => new LidoProtocol(pair))]
