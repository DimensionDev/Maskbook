import { AAVE_PAIRS, LDO_PAIRS, VENUS_PAIRS } from '../constants'
import { LidoProtocol } from './LDOProtocol'
import { AAVEProtocol } from './AAVEProtocol'
import { VenusProtocol } from './VenusProtocol'

export const SavingsProtocols = [
    ...LDO_PAIRS.map((pair) => new LidoProtocol(pair)),
    ...AAVE_PAIRS.map((pair) => new AAVEProtocol(pair)),
    ...VENUS_PAIRS.map((pair) => new VenusProtocol(pair)),
]
