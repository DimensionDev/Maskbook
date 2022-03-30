import { BENQI_PAIRS } from './benqi/pairs'
import { COMPOUND_PAIRS } from './compound/pairs'
import { LDO_PAIRS } from './ldo/pairs'
import { aaveLazyResolver } from './aave/AAVEResolver'

export const SavingsProtocols = [...LDO_PAIRS, ...BENQI_PAIRS, ...COMPOUND_PAIRS]

export const LazyProtocolsResolvers = [aaveLazyResolver]
