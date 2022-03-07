import { LDO_PAIRS, CONVEX_PAIRS } from '../constants'
import { LidoProtocol } from './LDOProtocol'
import { ConvexProtocol } from './ConvexProtocol'

export const SavingsProtocols = [
    ...LDO_PAIRS.map((pair) => new LidoProtocol(pair)),
    ...CONVEX_PAIRS.map((pair) => new ConvexProtocol(pair)),
]
