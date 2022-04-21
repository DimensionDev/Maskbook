import { YearnChains } from './constants'
import type { ChainId, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { chunk } from 'lodash-unified'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { ChainIdYearn, FungibleTokenPair } from './types'

export function splitToPair(details: FungibleTokenDetailed[] | undefined): FungibleTokenPair[] {
    if (!details || details.length % 2 !== 0) return EMPTY_LIST
    return chunk(details, 2) as FungibleTokenPair[]
}

export function isValidYearnChain(chainId: ChainId): chainId is ChainIdYearn {
    return Reflect.has(YearnChains, chainId)
}
