import { useContext, useEffect, useMemo, useRef } from 'react'
import { useAsyncRetry } from 'react-use'
import { Pair, Token as UniswapToken, TokenAmount } from '@uniswap/sdk'
import { useBlockNumber, useChainId } from '../../../../web3/hooks/useChainState'
import { PluginTraderRPC } from '../../messages'
import { getPairAddress } from '../../helpers'
import { TradeContext } from '../useTradeContext'
import { usePairContracts } from './usePairContract'
import { useMutlipleContractSingleData } from '../../../../web3/hooks/useMulticall'

export enum PairState {
    NOT_EXISTS,
    EXISTS,
    INVALID,
}

export type TokenPair = [UniswapToken, UniswapToken]

export function usePairs(tokenPairs: readonly TokenPair[]) {
    const chainId = useChainId()
    const context = useContext(TradeContext)

    const listOfPairAddress = useMemo(
        () =>
        {
            console.log('DEBUG: context')
            console.log(context)

            return tokenPairs.map(([tokenA, tokenB]) =>
                tokenA && tokenB && !tokenA.equals(tokenB) ? getPairAddress(
                    context?.FACTORY_CONTRACT_ADDRESS ?? '',
                    context?.INIT_CODE_HASH ?? '',
                    tokenA,
                    tokenB,
                ) : undefined,
            )
        },
        [context, tokenPairs],
    )

    useEffect(() => {
        console.log('DEBUG: list of address')
        console.log(listOfPairAddress)
    }, [listOfPairAddress.join('')])

    // auto refresh pair reserves for each block
    const blockNumber = useBlockNumber(chainId)

    // get reserves for each pair
    const contracts = usePairContracts([...new Set(listOfPairAddress.filter(Boolean) as string[])])
    const [results, calls, _, callback] = useMutlipleContractSingleData(
        contracts,
        new Array(contracts.length).fill('getReserves'),
        [],
    )
    const asyncResults = useAsyncRetry(() => callback(calls), [
        calls,
        blockNumber,
    ])

    // compose reserves from multicall results
    const listOfReserves = useMemo(() => {
        return results
            .map((x, i) => {
                if (x.error) return undefined
                return {
                    id: contracts[i].options.address,
                    reserve0: x.value._reserve0,
                    reserve1: x.value._reserve1,
                }
            })
            .filter(Boolean) as {
                id: string
                reserve0: string
                reserve1: string
            }[]
    }, [results, contracts])

    // compose pairs from list of reserves
    const pairs = useMemo(() => {
        return listOfPairAddress.map((address, i) => {
            const tokenA = tokenPairs[i][0]
            const tokenB = tokenPairs[i][1]
            if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
            const { reserve0, reserve1 } = listOfReserves.find((x) => x.id.toLowerCase() === address?.toLowerCase()) ?? {}
            if (!reserve0 || !reserve1) return [PairState.NOT_EXISTS, null]
            const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
            return [
                PairState.EXISTS,
                new Pair(new TokenAmount(token0, reserve0.toString()), new TokenAmount(token1, reserve1.toString())),
            ] as const
        })
    }, [listOfPairAddress, listOfReserves, tokenPairs])

    return {
        ...asyncResults,
        value: pairs,
    }
}
