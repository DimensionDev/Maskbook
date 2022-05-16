import { useAsyncRetry } from 'react-use'
import { API_URL } from '../constants'
import { PluginDHedgeRPC } from '../messages'
import { Period, Pool, PoolType } from '../types'
import { useDHedgePoolManagerContract } from '../contracts/useDHedgePool'
import { useTokenConstants } from '@masknet/web3-shared-evm'
import { useChainId } from '@masknet/plugin-infra/src/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

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
