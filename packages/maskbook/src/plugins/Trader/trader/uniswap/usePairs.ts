import { useContext, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { Pair, Token as UniswapToken, TokenAmount } from '@uniswap/sdk'
import { useBlockNumber, useChainId } from '../../../../web3/hooks/useChainState'
import { PluginTraderRPC } from '../../messages'
import { getPairAddress } from '../../helpers'
import { TradeContext } from '../useTradeContext'

export enum PairState {
    NOT_EXISTS,
    EXISTS,
    INVALID,
}

export type TokenPair = [UniswapToken, UniswapToken]

export function usePairs(tokens: readonly TokenPair[]) {
    const chainId = useChainId()
    const context = useContext(TradeContext)

    const listOfPairAddress = useMemo(
        () =>
            tokens.map(([tokenA, tokenB]) =>
                tokenA && tokenB && !tokenA.equals(tokenB)
                    ? getPairAddress(
                          context?.FACTORY_CONTRACT_ADDRESS ?? '',
                          context?.INIT_CODE_HASH ?? '',
                          tokenA,
                          tokenB,
                      )
                    : undefined,
            ),
        [context, tokens],
    )

    // auto refresh pair reserves for each block
    const blockNumber = useBlockNumber(chainId)

    // get reserves for each pair
    const { value: results = [], ...asyncResults } = useAsyncRetry(async () => {
        const listOfAddress = listOfPairAddress.filter(Boolean) as string[]
        if (!listOfAddress.length) return []
        return PluginTraderRPC.queryPairs(context?.GRAPH_API ?? '', listOfAddress)
    }, [[...new Set(listOfPairAddress).values()].join(), blockNumber, context])

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
