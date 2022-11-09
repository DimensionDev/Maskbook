import { AAVE_PAIRS, LDO_PAIRS } from '../constants.js'
import { LidoProtocol } from './LDOProtocol.js'
import { AAVEProtocol } from './AAVEProtocol.js'

export const SavingsProtocols = [
    ...LDO_PAIRS.map((pair) => new LidoProtocol(pair)),
    ...AAVE_PAIRS.map((pair) => new AAVEProtocol(pair)),
]
