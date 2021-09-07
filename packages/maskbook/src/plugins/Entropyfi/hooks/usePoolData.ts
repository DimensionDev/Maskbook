// @ts-nocheck
import { useSingleContractMultipleData } from '@masknet/web3-shared'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { poolAddressMap, tokenMap } from '../constants'
import { usePoolContract } from '../contracts'

// export function usePoolState(): PoolState {
//     const state = useAppSelector((state: AppState) => state.pools)
//     return state
// }

export function useUserShortPrincipalBalance(
    userAddress: string,
    poolId: string,
    chainId: number,
): CurrencyAmount<Token> | undefined {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)

    // const inputs: string[] = useMemo(() => [userAddress], [userAddress])
    const [results, calls, _, callback] = useSingleContractMultipleData(
        contract,
        ['userShortPrincipalBalance'],
        [[userAddress]],
    )

    const asyncResult = useAsyncRetry(() => callback(calls), [calls])
    const [amount] = results

    return useMemo(
        () =>
            userAddress && poolAddress && amount
                ? CurrencyAmount.fromRawAmount(tokenMap[chainId][poolId].principalToken, amount.toString())
                : undefined,
        [poolId, amount, chainId, userAddress],
    )
}

export function useUserLongPrincipalBalance(
    userAddress: string,
    poolId: string,
    chainId: number,
): CurrencyAmount<Token> | undefined {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)

    const inputs = useMemo(() => [userAddress], [userAddress])
    const [amount] = useSingleContractMultipleData(contract, ['userLongPrincipalBalance'], [[userAddress]])

    return useMemo(
        () =>
            userAddress && poolAddress && amount
                ? CurrencyAmount.fromRawAmount(tokenMap[chainId][poolId].principalToken, amount.toString())
                : undefined,
        [poolId, amount, chainId, userAddress],
    )
}

export function useLastUpdateTimestamp(chainId: number, poolId: string): number | undefined {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)
    const [status] = useSingleContractMultipleData(contract, ['status'], [])
    // return status
    // @ts-ignore
    return useMemo(() => (poolAddress && status ? status?.lastUpdateTimestamp.toNumber() : undefined), [poolId, status])
}

export function useInitialPrice(chainId: number, poolId: string): string | undefined {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)
    const [status] = useSingleContractMultipleData(contract, ['status'], [])
    // return status
    return useMemo(
        () =>
            poolAddress && status
                ? poolId === 'ETH-GAS-USDT'
                    ? status.initialPrice.div(10 ** 9).toString()
                    : status.initialPrice.div(10 ** 8).toString()
                : undefined,
        [poolId, status],
    )
}

export function usePoolStatus(chainId: number, poolId: string): number | undefined {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)
    const [status] = useSingleContractMultipleData(contract, ['status'], [])
    // return status
    // @ts-ignore
    return useMemo(() => (poolAddress && status ? status.currState : []), [poolId, status])
}

export function useValuePerShortToken(chainId: number, poolId: string): string | undefined {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)
    const [value] = useSingleContractMultipleData(contract, ['valuePerShortToken'], [])
    // return status
    // @ts-ignore
    return useMemo(() => (poolAddress && value ? value.toString() : []), [poolId, value])
}

export function useValuePerLongToken(chainId: number, poolId: string): string | undefined {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)
    const [value] = useSingleContractMultipleData(contract, ['valuePerLongToken'], [])
    // return status
    return useMemo(() => (poolAddress && value ? value.toString() : undefined), [poolId, value])
}
