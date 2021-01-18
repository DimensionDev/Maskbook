import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { Pair, Pair as UniswapPair, Token as UniswapToken, TokenAmount } from '@uniswap/sdk'
import { useBlockNumber, useChainId } from '../../../../web3/hooks/useChainState'
import { PluginTraderRPC } from '../../messages'

export enum PairState {
    NOT_EXISTS,
    EXISTS,
    INVALID,
}

export type TokenPair = [UniswapToken, UniswapToken]

export function usePairs(from: string, tokens: readonly TokenPair[]) {
    const listOfPairAddress = useMemo(
        () =>
            tokens.map(([tokenA, tokenB]) =>
                tokenA && tokenB && !tokenA.equals(tokenB) ? UniswapPair.getAddress(tokenA, tokenB) : undefined,
            ),
        [tokens],
    )

    // auto refresh pair reserves for each block
    const chainId = useChainId()
    const blockNumber = useBlockNumber(chainId)

    // get reserves for each pair
    const { value: results = [], ...asyncResults } = useAsyncRetry(async () => {
        const listOfAddress = listOfPairAddress.filter(Boolean) as string[]
        if (!listOfAddress.length) return []
        return PluginTraderRPC.queryPairs(from, listOfAddress)
    }, [[...new Set(listOfPairAddress).values()].join(), from, blockNumber])

    const pairs = useMemo(() => {
        return listOfPairAddress.map((address, i) => {
            const tokenA = tokens[i][0]
            const tokenB = tokens[i][1]
            if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
            const { reserve0, reserve1 } = results.find((x) => x.id.toLowerCase() === address?.toLowerCase()) ?? {}
            if (!reserve0 || !reserve1) return [PairState.NOT_EXISTS, null]
            const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
            return [
                PairState.EXISTS,
                new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString())),
            ] as const
        })
    }, [results, tokens])

    return {
        ...asyncResults,
        value: pairs,
    }
}
