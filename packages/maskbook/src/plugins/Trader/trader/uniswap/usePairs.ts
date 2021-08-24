import { useContext, useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { Pair } from '@uniswap/v2-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useMutlipleContractSingleData } from '@masknet/web3-shared'
import { getPairAddress } from '../../helpers'
import { TradeContext } from '../useTradeContext'
import { usePairContracts } from '../../contracts/uniswap/usePairContract'

export enum PairState {
    NOT_EXISTS = 0,
    EXISTS = 1,
    INVALID = 2,
}

export type TokenPair = [Token, Token]

export function usePairs(tokenPairs: readonly TokenPair[]) {
    const context = useContext(TradeContext)

    const listOfPairAddress = useMemo(() => {
        if (!context) return []
        const { FACTORY_CONTRACT_ADDRESS, INIT_CODE_HASH } = context
        if (!FACTORY_CONTRACT_ADDRESS || !INIT_CODE_HASH) return []
        return tokenPairs.map(([tokenA, tokenB]) =>
            tokenA && tokenB && !tokenA.equals(tokenB)
                ? getPairAddress(FACTORY_CONTRACT_ADDRESS, INIT_CODE_HASH, tokenA, tokenB)
                : undefined,
        )
    }, [context, tokenPairs])

    // get reserves for each pair
    const contracts = usePairContracts([...new Set(listOfPairAddress.filter(Boolean) as string[])])
    const [results, calls, _, callback] = useMutlipleContractSingleData(
        contracts,
        Array.from<'getReserves'>({ length: contracts.length }).fill('getReserves'),
        [],
    )
    const asyncResults = useAsyncRetry(() => callback(calls), [calls])

    // compose reserves from multicall results
    const listOfReserves = useMemo(() => {
        type Result = {
            id: string
            reserve0: string
            reserve1: string
        }
        return results
            .map((x, i): Result | undefined => {
                if (x.error || !x.value) return undefined
                return {
                    id: contracts[i].options.address,
                    reserve0: x.value._reserve0,
                    reserve1: x.value._reserve1,
                }
            })
            .filter((value): value is Result => value !== undefined)
    }, [results, contracts])

    // compose pairs from list of reserves
    const pairs = useMemo(() => {
        return listOfPairAddress.map((address, i) => {
            const tokenA = tokenPairs[i][0]
            const tokenB = tokenPairs[i][1]
            if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
            const { reserve0, reserve1 } =
                listOfReserves.find((x) => x.id.toLowerCase() === address?.toLowerCase()) ?? {}
            if (!reserve0 || !reserve1) return [PairState.NOT_EXISTS, null]
            const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
            return [
                PairState.EXISTS,
                new Pair(
                    CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
                    CurrencyAmount.fromRawAmount(token1, reserve1.toString()),
                ),
            ] as const
        })
    }, [listOfPairAddress, listOfReserves, tokenPairs])

    return {
        ...asyncResults,
        value: pairs,
    }
}
