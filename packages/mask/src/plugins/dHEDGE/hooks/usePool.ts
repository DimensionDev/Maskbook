import { useAsyncRetry } from 'react-use'
import { API_URL } from '../constants'
import { PluginDHedgeRPC } from '../messages'
import { Period, Pool, PoolType } from '../types'
import { useDHedgePoolManagerContract } from '../contracts/useDHedgePool'
import { useChainId, useTokenConstants } from '@masknet/web3-shared-evm'

export function useFetchPool(address: string) {
    return useAsyncRetry(async () => {
        if (!address) return
        return PluginDHedgeRPC.fetchPool(address, API_URL)
    }, [address])
}

export function useFetchPoolHistory(address: string, period: Period, sort = true) {
    return useAsyncRetry(async () => {
        if (!address) return []
        return PluginDHedgeRPC.fetchPoolPerformance(address, period, API_URL, sort)
    }, [address, period, sort])
}

export function usePoolDepositAssets(pool?: Pool) {
    const chainId = useChainId()
    const { sUSD_ADDRESS } = useTokenConstants()
    const poolManagerContract = useDHedgePoolManagerContract(pool?.managerLogicAddress)
    console.log(poolManagerContract)
    return useAsyncRetry(async () => {
        if (!pool) return
        if (pool.poolType === PoolType.v1) return sUSD_ADDRESS ? [sUSD_ADDRESS] : undefined
        return poolManagerContract?.methods.getDepositAssets().call()
    }, [pool, chainId, sUSD_ADDRESS, poolManagerContract])
}
