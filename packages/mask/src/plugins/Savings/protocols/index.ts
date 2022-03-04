import LidoProtocol from './LDOProtocol'
import ConvexProtocol from './convex/ConvexProtocol'
import { CONVEX_PAIRS, LDO_PAIRS } from '../constants'

export const SavingsProtocols = [
    ...LDO_PAIRS.map((pair) => new LidoProtocol(pair)),
    ...CONVEX_PAIRS.map((pair) => new ConvexProtocol(pair)),
]
