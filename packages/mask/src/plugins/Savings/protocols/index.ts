import { LDO_PAIRS } from '../constants'
import { VENUS_PAIRS } from '../constants/venus'
import { LidoProtocol } from './LDOProtocol'
import { VenusProtocol } from './VenusProtocol'

export const SavingsProtocols = [
    ...LDO_PAIRS.map((pair) => new LidoProtocol(pair)),
    ...VENUS_PAIRS.map((pair) => new VenusProtocol(pair)),
]
