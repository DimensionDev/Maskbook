import { useChainId } from '@masknet/web3-shared'
// import type { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useAsyncRetry } from 'react-use'
import { PluginEntropyfiRPC } from '../messages'

export function usePoolData() {
    const chainId = useChainId()
    return useAsyncRetry(() => PluginEntropyfiRPC.fetchData(), [chainId])
}
// export function useUserShortPrincipalBalance(
//     userAddress: string,
//     poolId: string,
//     chainId: number,
// ): CurrencyAmount<Token> | undefined {

//     const poolAddress = poolAddressMap[chainId][poolId]
//     const contract = usePoolContract(poolAddress)

//     const inputs = useMemo(() => [userAddress], [userAddress])
//     const amount = useSingleCallResult(contract, 'userShortPrincipalBalance', inputs).result

//     return useMemo(
//         () =>
//             userAddress && poolAddress && amount
//                 ? CurrencyAmount.fromRawAmount(tokenMap[chainId][poolId]['principalToken'], amount.toString())
//                 : undefined,
//         [poolId, amount, chainId, userAddress],
//     )
// }

// export function useUserLongPrincipalBalance(
//     userAddress: string,
//     poolId: string,
//     chainId: number,
// ): CurrencyAmount<Token> | undefined {
//     const poolAddress = poolAddressMap[chainId][poolId]
//     const contract = usePoolContract(poolAddress, false)

//     const inputs = useMemo(() => [userAddress], [userAddress])
//     const amount = useSingleCallResult(contract, 'userLongPrincipalBalance', inputs).result

//     return useMemo(
//         () =>
//             userAddress && poolAddress && amount
//                 ? CurrencyAmount.fromRawAmount(tokenMap[chainId][poolId]['principalToken'], amount.toString())
//                 : undefined,
//         [poolId, amount, chainId, userAddress],
//     )
// }

// export function useLastUpdateTimestamp(chainId: number, poolId: string): number | undefined {
//     const poolAddress = poolAddressMap[chainId][poolId]
//     const contract = usePoolContract(poolAddress, false)
//     const status = useSingleCallResult(contract, 'status', undefined).result
//     // return status
//     return useMemo(() => (poolAddress && status ? status.lastUpdateTimestamp.toNumber() : undefined), [poolId, status])
// }

// export function useInitialPrice(chainId: number, poolId: string): string | undefined {
//     const poolAddress = poolAddressMap[chainId][poolId]
//     const contract = usePoolContract(poolAddress, false)
//     const status = useSingleCallResult(contract, 'status', undefined).result
//     // return status
//     return useMemo(
//         () =>
//             poolAddress && status
//                 ? poolId === 'ETH-GAS-USDT'
//                     ? status.initialPrice.div(10 ** 9).toString()
//                     : status.initialPrice.div(10 ** 8).toString()
//                 : undefined,
//         [poolId, status],
//     )
// }

// export function usePoolStatus(chainId: number, poolId: string): number | undefined {
//     const poolAddress = poolAddressMap[chainId][poolId]
//     const contract = usePoolContract(poolAddress, false)
//     const status = useSingleCallResult(contract, 'status', undefined).result
//     // return status
//     return useMemo(() => (poolAddress && status ? status.currState : undefined), [poolId, status])
// }

// export function useValuePerShortToken(chainId: number, poolId: string): string | undefined {
//     const poolAddress = poolAddressMap[chainId][poolId]
//     const contract = usePoolContract(poolAddress, false)
//     const value = useSingleCallResult(contract, 'valuePerShortToken', undefined).result
//     // return status
//     return useMemo(() => (poolAddress && value ? value.toString() : undefined), [poolId, value])
// }

// export function useValuePerLongToken(chainId: number, poolId: string): string | undefined {
//     const poolAddress = poolAddressMap[chainId][poolId]
//     const contract = usePoolContract(poolAddress, false)
//     const value = useSingleCallResult(contract, 'valuePerLongToken', undefined).result
//     // return status
//     return useMemo(() => (poolAddress && value ? value.toString() : undefined), [poolId, value])
// }
