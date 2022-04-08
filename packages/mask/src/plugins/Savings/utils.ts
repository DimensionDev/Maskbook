import { YearnChains } from './constants'
import type { ChainId, FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export function splitToPair(a: FungibleTokenDetailed[] | undefined): [FungibleTokenDetailed, FungibleTokenDetailed][] {
    if (!a) {
        return []
    }
    return a.reduce(function (result: any, value, index, array) {
        if (index % 2 === 0) {
            result.push(array.slice(index, index + 2))
        }
        return result
    }, [])
}

export function isValidYearnChain(chainId: ChainId) {
    return chainId in YearnChains
}
