// @ts-nocheck
import { useERC20TokenContract, useSingleContractMultipleData } from '@masknet/web3-shared'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import { poolAddressMap, tokenMap, PRECISION } from '../constants'
import { usePoolContract } from '../contracts'

export type State = {
    shortValue: string | undefined // ethers BigNumber => string
    longValue: string | undefined // ethers BigNumber => string
    sponsorValue: string | undefined // ethers BigNumber => string
    // shortAPY: string // (short+long+ sponsor)/short bigNumberjs bignumber => string
    initialPrice: string | undefined // coundDownValue in entropy-app
    locked: boolean
    gameDuration: number
    bidDuration: number
    lastUpdateTimestamp: number
}
// export function usePoolState(): PoolState {
//     const state = useAppSelector((state: AppState) => state.pools)
//     return state
// }

export function useUserShortPrincipalBalance(userAddress: string, poolId: string, chainId: number) {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)

    // const inputs: string[] = useMemo(() => [userAddress], [userAddress])
    const [results, calls, _, callback] = useSingleContractMultipleData(
        contract,
        ['userShortPrincipalBalance'],
        [[userAddress]],
    )

    useAsyncRetry(() => callback(calls), [calls, callback])
    return useMemo(
        () =>
            userAddress && poolAddress && results && results.length > 0 && results[0].value
                ? CurrencyAmount.fromRawAmount(tokenMap[chainId][poolId].principalToken, results[0].value.toString())
                : undefined,
        [poolId, results, chainId, userAddress],
    )
}

export function useUserLongPrincipalBalance(
    userAddress: string,
    poolId: string,
    chainId: number,
): CurrencyAmount<Token> | undefined {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)
    const [results, calls, _, callback] = useSingleContractMultipleData(
        contract,
        ['userLongPrincipalBalance'],
        [[userAddress]],
    )

    useAsyncRetry(() => callback(calls), [calls, callback])
    return useMemo(
        () =>
            userAddress && poolAddress && results && results.length > 0 && results[0].value
                ? CurrencyAmount.fromRawAmount(tokenMap[chainId][poolId].principalToken, results[0].value.toString())
                : undefined,
        [poolId, results, chainId, userAddress],
    )
}

export function useLastUpdateTimestamp(chainId: number, poolId: string): number | undefined {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)
    const [results, calls, _, callback] = useSingleContractMultipleData(contract, ['status'], [[]])

    useAsyncRetry(() => callback(calls), [calls, callback])

    // return status
    // @ts-ignore
    // console.log('result', results)
    return useMemo(
        () =>
            poolAddress && results && results.length > 0 && results[0].value
                ? results[0].value?.lastUpdateTimestamp
                : undefined,
        [poolId, results, chainId],
    )
}

export function useInitialPrice(chainId: number, poolId: string): string | undefined {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)
    const [results, calls, _, callback] = useSingleContractMultipleData(contract, ['status'], [[]])
    useAsyncRetry(() => callback(calls), [calls, callback])
    // return status
    return useMemo(
        () =>
            poolAddress && results && results.length > 0 && results[0].value
                ? poolId === 'ETH-GAS-USDT'
                    ? new BigNumber(results[0].value.initialPrice).div(10 ** 9).toString()
                    : new BigNumber(results[0].value.initialPrice).div(10 ** 8).toString()
                : undefined,
        [poolId, results, chainId],
    )
}

export function usePoolStatus(chainId: number, poolId: string): number | undefined {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)
    const [results, calls, _, callback] = useSingleContractMultipleData(contract, ['status'], [[]])
    useAsyncRetry(() => callback(calls), [calls, callback])
    // return status
    // @ts-ignore
    return useMemo(
        () => (poolAddress && results && results.length > 0 && results[0].value ? results[0].value?.currState : ''),
        [poolId, results, chainId],
    )
}

export function useValuePerShortToken(chainId: number, poolId: string): string | undefined {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)
    const [results, calls, _, callback] = useSingleContractMultipleData(contract, ['valuePerShortToken'], [[]])
    useAsyncRetry(() => callback(calls), [calls, callback])
    // return status
    return useMemo(
        () =>
            poolAddress && results && results.length > 0 && results[0].value ? results[0].value.toString() : undefined,
        [poolId, results, chainId],
    )
}

export function useValuePerLongToken(chainId: number, poolId: string): string | undefined {
    const poolAddress = poolAddressMap[chainId][poolId]
    const contract = usePoolContract(poolAddress)
    const [results, calls, _, callback] = useSingleContractMultipleData(contract, ['valuePerLongToken'], [[]])
    useAsyncRetry(() => callback(calls), [calls, callback])
    // return status
    return useMemo(
        () =>
            poolAddress && results && results.length > 0 && results[0].value ? results[0].value.toString() : undefined,
        [poolId, results, chainId],
    )
}

export function useTokenTotalSupply(token: Token): CurrencyAmount<Token> | undefined {
    const tokenContract = useERC20TokenContract(token?.address)
    const [results, calls, _, callback] = useSingleContractMultipleData(tokenContract, ['totalSupply'], [[]])
    useAsyncRetry(() => callback(calls), [calls, callback])
    return useMemo(
        () =>
            tokenContract && results && results.length > 0 && results[0].value
                ? CurrencyAmount.fromRawAmount(token, results[0].value.toString())
                : undefined,
        [results, token],
    )
}

export function useShortTokenValue(chainId: number, poolId: string): string | undefined {
    const token = tokenMap[chainId][poolId].shortToken
    const shortTokenSupply = useTokenTotalSupply(token)
    const shortTokenValue = useValuePerShortToken(chainId, poolId)
    const shortValue =
        !!shortTokenSupply && !!shortTokenValue
            ? new BigNumber(shortTokenSupply.toExact()).multipliedBy(shortTokenValue).div(PRECISION).toString()
            : undefined
    return shortValue
}

export function useLongTokenValue(chainId: number, poolId: string): string | undefined {
    const token = tokenMap[chainId][poolId].longToken
    const longTokenSupply = useTokenTotalSupply(token)
    const longTokenValue = useValuePerLongToken(chainId, poolId)
    const longValue =
        !!longTokenSupply && !!longTokenValue
            ? new BigNumber(longTokenSupply.toExact()).multipliedBy(longTokenValue).div(PRECISION).toString()
            : undefined
    return longValue
}
