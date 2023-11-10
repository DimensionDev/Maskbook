import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import type { Token } from '@uniswap/sdk-core'
import { getCreate2Address, pack } from '@masknet/web3-shared-evm'

/** cache[token0Address][token1Address] = value  */
type PairCache = Record<string, Record<string, string>>

const map = new Map<string, PairCache>()

// This is a dynamically version of address generate algorithm borrowed from the Pair class of uniswap-skd
export function getPairAddress(factoryAddress: string, initCodeHash: string, tokenA?: Token, tokenB?: Token) {
    if (!tokenA || !tokenB) return ''
    const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks
    let cache = map.get(initCodeHash)

    const token0Addr = tokens[0].address
    const token1Addr = tokens[1].address
    if (cache?.[token0Addr]?.[token1Addr] === undefined) {
        cache = {
            ...cache,
            [token0Addr]: {
                ...cache?.[token0Addr],
                [token1Addr]: getCreate2Address(
                    factoryAddress,
                    web3_utils.keccak256(pack(['address', 'address'], [token0Addr, token1Addr])),
                    initCodeHash,
                ),
            },
        }
        map.set(initCodeHash, cache)
    }
    return cache[token0Addr][token1Addr]
}
