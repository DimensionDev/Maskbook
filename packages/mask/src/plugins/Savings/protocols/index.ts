import { AAVE_PAIRS, LDO_PAIRS } from '../constants'
import { LidoProtocol } from './LDOProtocol'
import { AAVEProtocol } from './AAVEProtocol'

export const SavingsProtocols = [
    ...LDO_PAIRS.map((pair) => new LidoProtocol(pair)),
    ...AAVE_PAIRS.map((pair) => new AAVEProtocol(pair)),
]
