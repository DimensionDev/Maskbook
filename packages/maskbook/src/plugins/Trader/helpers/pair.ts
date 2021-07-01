import type { Token } from '@uniswap/sdk-core'
import { getCreate2Address } from '@ethersproject/address'
import { pack, keccak256 } from '@ethersproject/solidity'

interface PairCache {
    [token0Address: string]: {
        [token1Address: string]: string
    }
}

const map = new Map<string, PairCache>()

// This is a dynamically version of address generate algorithm borrowed from the Pair class of uniswap-skd
export function getPairAddress(factoryAddress: string, initCodeHash: string, tokenA?: Token, tokenB?: Token) {
    if (!tokenA || !tokenB) return ''
    const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks
    let cache = map.get(initCodeHash)

    if (cache?.[tokens[0].address]?.[tokens[1].address] === undefined) {
        cache = {
            ...cache,
            [tokens[0].address]: {
                ...cache?.[tokens[0].address],
                [tokens[1].address]: getCreate2Address(
                    factoryAddress,
                    keccak256(['bytes'], [pack(['address', 'address'], [tokens[0].address, tokens[1].address])]),
                    initCodeHash,
                ),
            },
        }
        map.set(initCodeHash, cache)
    }
    return cache?.[tokens[0].address][tokens[1].address]
}
