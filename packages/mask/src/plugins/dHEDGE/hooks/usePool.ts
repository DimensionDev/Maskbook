import { useAsyncRetry } from 'react-use'
import { API_URL } from '../constants.js'
import { PluginDHedgeRPC } from '../messages.js'
import { Period, Pool, PoolType } from '../types.js'
import { useDHedgePoolManagerContract } from '../contracts/useDHedgePool.js'
import { useTokenConstants } from '@masknet/web3-shared-evm'
import { useChainId } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'

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
    const { sUSD_ADDRESS } = useTokenConstants()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const poolManagerContract = useDHedgePoolManagerContract(chainId, pool?.managerLogicAddress)
    return useAsyncRetry(async () => {
        if (!pool) return
        if (pool.poolType === PoolType.v1) return sUSD_ADDRESS ? [sUSD_ADDRESS] : undefined
        return poolManagerContract?.methods.getDepositAssets().call()
    }, [pool, chainId, sUSD_ADDRESS, poolManagerContract])
}
