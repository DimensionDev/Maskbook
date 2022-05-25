import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useProviderType } from './useProviderType'
import { useWeb3State } from './useWeb3State'

export function useWeb3Provider<T extends NetworkPluginID>(pluginID?: T, options?: Web3Helper.Web3ConnectionOptions<T>) {
    type GetWeb3Provider = (options?: Web3Helper.Web3ConnectionOptions<T>) => Promise<Web3Helper.Web3Provider<T>>

    const { Connection } = useWeb3State(pluginID)
    const chainId = useChainId(pluginID)
    const account = useAccount(pluginID)
    const providerType = useProviderType(pluginID)

    const { value: web3Provider = null } = useAsyncRetry(async () => {
        if (!Connection?.getWeb3Provider) return null
        return (Connection.getWeb3Provider as GetWeb3Provider)({
            account,
            chainId,
            providerType,
            ...options,
        } as Web3Helper.Web3ConnectionOptions<T>)
    }, [account, chainId, providerType, Connection, JSON.stringify(options)])

    return web3Provider
}
