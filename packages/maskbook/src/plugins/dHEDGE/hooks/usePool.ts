import { useAsyncRetry } from 'react-use'
import { PluginDHedgeRPC } from '../messages'
import { useApiURL } from './useUrl'
import { Period, Pool, PoolType } from '../types'
import { useDHedgePoolManagerContract } from '../contracts/useDHedgePool'
import { useChainId, useTokenConstants } from '@masknet/web3-shared'

export function useFetchPool(address: string) {
    const API_URL = useApiURL()
    return useAsyncRetry(async () => {
        if (!API_URL) return
        return PluginDHedgeRPC.fetchPool(address, API_URL)
    }, [address])
}

export function useFetchPoolHistory(address: string, period: Period, sort = true) {
    const API_URL = useApiURL()
    return useAsyncRetry(async () => {
        if (!API_URL) return
        return PluginDHedgeRPC.fetchPoolPerformance(address, period, API_URL, sort)
    }, [address, period, sort])
}

export function usePoolDepositAssets(pool: Pool) {
    const chainId = useChainId()
    const { sUSD_ADDRESS } = useTokenConstants()
    const poolManagerContract = useDHedgePoolManagerContract(pool.managerLogicAddress)
    return useAsyncRetry(async () => {
        if (pool.poolType === PoolType.v1) return [sUSD_ADDRESS]
        if (!poolManagerContract) return
        return await poolManagerContract.methods.getDepositAssets().call()
    }, [pool, chainId])
}
