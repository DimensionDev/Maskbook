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
    const { Connection } = useWeb3State(pluginID)
    const chainId = useChainId(pluginID)
    const account = useAccount(pluginID)
    const providerType = useProviderType(pluginID)

    const { value: web3 = null } = useAsyncRetry(async () => {
        return Connection?.getWeb3?.({
            account,
            chainId,
            providerType,
            ...options,
        })
    }, [account, chainId, providerType, JSON.stringify(options)])

    return web3 as Web3Helper.Web3Scope<S, T> | null
}
