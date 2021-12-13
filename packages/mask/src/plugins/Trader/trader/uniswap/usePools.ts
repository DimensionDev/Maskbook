import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import BigNumber from 'bignumber.js'
import { computePoolAddress, Pool, FeeAmount } from '@uniswap/v3-sdk'
import type { Token, Currency } from '@uniswap/sdk-core'
import { MulticallStateType, useMultipleContractSingleData } from '@masknet/web3-shared-evm'
import { usePoolContracts } from '../../contracts/uniswap/usePoolContract'
import type { TradeProvider } from '@masknet/public-api'
import { useGetTradeContext } from '../useGetTradeContext'
import { TargetChainIdContext } from '../useTargetChainIdContext'
import { useTargetBlockNumber } from '../useTargetBlockNumber'

export enum PoolState {
    LOADING = 0,
    NOT_EXISTS = 1,
    EXISTS = 2,
    INVALID = 3,
}

export function usePools(
    tradeProvider: TradeProvider,
    poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][],
): [PoolState, Pool | null][] {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const context = useGetTradeContext(tradeProvider)

    const transformed: ([Token, Token, FeeAmount] | null)[] = useMemo(() => {
        return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
            if (!chainId || !currencyA || !currencyB || !feeAmount) return null

            const tokenA = currencyA?.wrapped
            const tokenB = currencyB?.wrapped
            if (!tokenA || !tokenB || tokenA.equals(tokenB)) return null
            const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
            return [token0, token1, feeAmount]
        })
    }, [chainId, poolKeys])

    const poolAddresses = useMemo(() => {
        return transformed.map((value) => {
            if (!context?.IS_UNISWAP_V3_LIKE) return ''
            if (!context?.FACTORY_CONTRACT_ADDRESS || !value) return ''
            return computePoolAddress({
                factoryAddress: context.FACTORY_CONTRACT_ADDRESS,
                tokenA: value[0],
                tokenB: value[1],
                fee: value[2],
            })
        })
    }, [chainId, transformed, context?.FACTORY_CONTRACT_ADDRESS])

    const poolContracts = usePoolContracts(poolAddresses, chainId)

    const { value: targetBlockNumber } = useTargetBlockNumber(chainId)

    const [slot0s, slot0sCalls, slot0sState, slot0sCallback] = useMultipleContractSingleData(
        poolContracts,
        Array.from<'slot0'>({ length: poolContracts.length }).fill('slot0'),
        [],
        chainId,
        targetBlockNumber,
    )
    const [liquidities, liquiditiesCalls, liquiditiesState, liquiditiesCallback] = useMultipleContractSingleData(
        poolContracts,
        Array.from<'liquidity'>({ length: poolContracts.length }).fill('liquidity'),
        [],
        chainId,
        targetBlockNumber,
    )

    useAsyncRetry(() => slot0sCallback(slot0sCalls), [slot0sCallback, slot0sCalls])
    useAsyncRetry(() => liquiditiesCallback(liquiditiesCalls), [liquiditiesCallback, liquiditiesCalls])

    return useMemo(() => {
        return poolKeys.map((_key, index) => {
            const [token0, token1, fee] = transformed[index] ?? []
            if (!token0 || !token1 || !fee) return [PoolState.INVALID, null]

            const { value: slot0, error: slot0Error } = slot0s[index] ?? {}
            const { value: liquidity, error: liquidityError } = liquidities[index] ?? {}
            const slot0Loading = slot0sState.type === MulticallStateType.PENDING
            const liquiditiesLoading = liquiditiesState.type === MulticallStateType.PENDING

            if (slot0Error || liquidityError) return [PoolState.INVALID, null]
            if (slot0Loading || liquiditiesLoading) return [PoolState.LOADING, null]

            if (!slot0 || !liquidity) return [PoolState.NOT_EXISTS, null]

            if (new BigNumber(slot0.sqrtPriceX96 ?? '0').isZero()) return [PoolState.NOT_EXISTS, null]

            try {
                return [
                    PoolState.EXISTS,
                    new Pool(token0, token1, fee, slot0.sqrtPriceX96, liquidity[0], Number.parseInt(slot0.tick, 10)),
                ]
            } catch (error) {
                console.error('Error when constructing the pool', error)
                return [PoolState.NOT_EXISTS, null]
            }
        })
    }, [slot0s, liquidities, slot0sState.type, liquiditiesState.type, poolKeys, transformed])
}

export function usePool(
    tradeProvider: TradeProvider,
    currencyA: Currency | undefined,
    currencyB: Currency | undefined,
    feeAmount: FeeAmount | undefined,
): [PoolState, Pool | null] {
    const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
        () => [[currencyA, currencyB, feeAmount]],
        [currencyA, currencyB, feeAmount],
    )

    return usePools(tradeProvider, poolKeys)[0]
}
