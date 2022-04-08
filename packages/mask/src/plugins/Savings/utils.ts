import { YearnChains } from './constants'
import type { ChainId, FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export function splitToPair(
    details: FungibleTokenDetailed[] | undefined,
): [FungibleTokenDetailed, FungibleTokenDetailed][] {
    if (!details) {
        return []
    }
    return details.reduce(function (result: [FungibleTokenDetailed, FungibleTokenDetailed][], value, index, array) {
        if (index % 2 === 0) {
            const slice = array.slice(index, index + 2)
            result.push([slice[0], slice[1]])
        }
        return result
    }, [])
}

export function isValidYearnChain(chainId: ChainId) {
    return Reflect.has(YearnChains, chainId)
}
