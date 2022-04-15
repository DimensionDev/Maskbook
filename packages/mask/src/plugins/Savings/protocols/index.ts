import { compoundLazyResolver } from './compound/pairs'
import { benqiLazyResolver } from './benqi/pairs'

import { LDO_PAIRS } from './ldo/pairs'
import { aaveLazyResolver } from './aave/AAVEResolver'
import { aurigamiLazyResolver } from './aurigami/pairs'
import { alpacaLazyResolver } from './alpaca/pairs'
import { giestLazyResolver } from './giest/pairs'
import { moolaLazyResolver } from './moola/pairs'
import { tranquilLazyResolver } from './tranquil/pairs'

export const SavingsProtocols = [...LDO_PAIRS]

export const LazyProtocolsResolvers = [
    aaveLazyResolver,
    compoundLazyResolver,
    benqiLazyResolver,
    aurigamiLazyResolver,
    alpacaLazyResolver,
    giestLazyResolver,
    moolaLazyResolver,
    tranquilLazyResolver,
]
