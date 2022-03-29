import { BENQI_PAIRS } from './pairs/benqi'
import { COMPOUND_PAIRS } from './pairs/compound'
import { LDO_PAIRS } from './pairs/ldo'
import { AAVE_PAIRS } from '../constants'

export const SavingsProtocols = [
    ...LDO_PAIRS,
    ...BENQI_PAIRS,
    ...COMPOUND_PAIRS,
    ...AAVE_PAIRS.map((pair) => new AAVEProtocol(pair))
]
