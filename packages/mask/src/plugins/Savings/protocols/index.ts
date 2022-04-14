import { AAVE_PAIRS, LDO_PAIRS, CONVEX_PAIRS } from '../constants'
import { LidoProtocol } from './LDOProtocol'
import { AAVEProtocol } from './AAVEProtocol'
import { ConvexProtocol } from './ConvexProtocol'

export const SavingsProtocols = [
    ...LDO_PAIRS.map((pair) => new LidoProtocol(pair)),
    ...AAVE_PAIRS.map((pair) => new AAVEProtocol(pair)),
    ...CONVEX_PAIRS.map((pair) => new ConvexProtocol(pair)),
]
