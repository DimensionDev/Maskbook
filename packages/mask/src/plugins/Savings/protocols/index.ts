import { LDO_PAIRS } from './ldo/pairs'
import type { ProtocolPairsResolver } from '../types'

import { aaveLazyResolver } from './aave/pairs'
import { compoundLazyResolver } from './compound/pairs'
import { benqiLazyResolver } from './benqi/pairs'

import { alpacaLazyResolver } from './alpaca/pairs'
import { moolaLazyResolver } from './moola/pairs'
import { aurigamiLazyResolver } from './aurigami/pairs'
import { giestLazyResolver } from './giest/pairs'
import { tranquilLazyResolver } from './tranquil/pairs'

export const SavingsProtocols = [...LDO_PAIRS]
export const LazyProtocolsResolvers: ProtocolPairsResolver[] = []

LazyProtocolsResolvers.push(aaveLazyResolver)

LazyProtocolsResolvers.push(compoundLazyResolver)
LazyProtocolsResolvers.push(benqiLazyResolver)
LazyProtocolsResolvers.push(alpacaLazyResolver)
LazyProtocolsResolvers.push(moolaLazyResolver)
LazyProtocolsResolvers.push(aurigamiLazyResolver)
LazyProtocolsResolvers.push(giestLazyResolver)
LazyProtocolsResolvers.push(tranquilLazyResolver)
