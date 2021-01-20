import type { Token } from '@uniswap/sdk'
import { getCreate2Address } from '@ethersproject/address'
import { pack, keccak256 } from '@ethersproject/solidity'

let PAIR_ADDRESS_CACHE: { [token0Address: string]: { [token1Address: string]: string } } = {}

// This is a dynamically version of address generate algorithm borrowed from the Pair class of uniswap-skd
export function getPairAddress(factoryAddress: string, initCodeHash: string, tokenA?: Token, tokenB?: Token) {
    if (!tokenA || !tokenB) return ''
    const tokens = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA] // does safety checks

    if (PAIR_ADDRESS_CACHE?.[tokens[0].address]?.[tokens[1].address] === undefined) {
        PAIR_ADDRESS_CACHE = {
            ...PAIR_ADDRESS_CACHE,
            [tokens[0].address]: {
                ...PAIR_ADDRESS_CACHE?.[tokens[0].address],
                [tokens[1].address]: getCreate2Address(
                    factoryAddress,
                    keccak256(['bytes'], [pack(['address', 'address'], [tokens[0].address, tokens[1].address])]),
                    initCodeHash,
                ),
            },
        }
    }
    return PAIR_ADDRESS_CACHE[tokens[0].address][tokens[1].address]
}
