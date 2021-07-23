import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { computePoolAddress, Pool, FeeAmount } from '@uniswap/v3-sdk'
import type { Token, Currency } from '@uniswap/sdk-core'
import { MulticalStateType, useChainId, useMutlipleContractSingleData, useTraderConstants } from '@masknet/web3-shared'
import { usePoolContracts } from '../../contracts/uniswap/usePoolContract'

export enum PoolState {
    LOADING,
    NOT_EXISTS,
    EXISTS,
    INVALID,
}

export function usePools(
    poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][],
): [PoolState, Pool | null][] {
    const chainId = useChainId()
    const { UNISWAP_V3_FACTORY_ADDRESS } = useTraderConstants(chainId)

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

    const poolAddresses: string[] = useMemo(() => {
        return transformed.map((value) => {
            if (!UNISWAP_V3_FACTORY_ADDRESS || !value) return ''
            return computePoolAddress({
                factoryAddress: UNISWAP_V3_FACTORY_ADDRESS,
                tokenA: value[0],
                tokenB: value[1],
                fee: value[2],
            })
        })
    }, [chainId, transformed, UNISWAP_V3_FACTORY_ADDRESS])
    const poolContracts = usePoolContracts(poolAddresses)

    console.log({
        poolAddresses,
        poolContracts,
    })

    const [slot0s, , slot0sState] = useMutlipleContractSingleData(poolContracts, ['slot0'], [])
    const [liquidities, , liquiditiesState] = useMutlipleContractSingleData(poolContracts, ['liquidity'], [])

    return useMemo(() => {
        return poolKeys.map((_key, index) => {
            const [token0, token1, fee] = transformed[index] ?? []
            if (!token0 || !token1 || !fee) return [PoolState.INVALID, null]

            const { value: slot0, error: slot0Error } = slot0s[index]
            const { value: liquidity, error: liquidityError } = liquidities[index]
            const slot0Loading = slot0sState.type === MulticalStateType.PENDING
            const liquiditiesLoading = liquiditiesState.type === MulticalStateType.PENDING

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
    currencyA: Currency | undefined,
    currencyB: Currency | undefined,
    feeAmount: FeeAmount | undefined,
): [PoolState, Pool | null] {
    const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
        () => [[currencyA, currencyB, feeAmount]],
        [currencyA, currencyB, feeAmount],
    )

    return usePools(poolKeys)[0]
}
