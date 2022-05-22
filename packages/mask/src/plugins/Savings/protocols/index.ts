import { compoundLazyResolver } from './compound/pairs'
import { benqiLazyResolver } from './benqi/pairs'

import { LDO_PAIRS } from './ldo/pairs'
import { aaveLazyResolver } from './aave/AAVEResolver'
import { alpacaLazyResolver } from './alpaca/pairs'
import { moolaLazyResolver } from './moola/pairs'

export const SavingsProtocols = [...LDO_PAIRS]

export const LazyProtocolsResolvers = [
    aaveLazyResolver,
    compoundLazyResolver,
    benqiLazyResolver,
    alpacaLazyResolver,
    moolaLazyResolver,
]
