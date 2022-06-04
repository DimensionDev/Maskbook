/// <reference types="web3" />
import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useProviderType } from './useProviderType'
import { useWeb3State } from './useWeb3State'

export function useWeb3<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    type Result = S extends 'all' ? Web3Helper.Web3All : Web3Helper.Web3<T>
    type GetWeb3 = (options?: Web3Helper.Web3ConnectionOptions<T>) => Promise<Web3Helper.Web3<T>>

    const { Connection } = useWeb3State(pluginID)
    const chainId = useChainId(pluginID)
    const account = useAccount(pluginID)
    const providerType = useProviderType(pluginID)

    const { value: web3 = null } = useAsyncRetry(async () => {
        if (!Connection?.getWeb3) return null
        return (Connection.getWeb3 as GetWeb3)({
            account,
            chainId,
            providerType,
            ...options,
        } as Web3Helper.Web3ConnectionOptions<T>)
    }, [account, chainId, providerType, JSON.stringify(options)])

    return web3 as Result
}
