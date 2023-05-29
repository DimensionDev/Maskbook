import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useWeb3Provider<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: ConnectionOptions<T>,
): Web3Helper.Web3ProviderScope<S, T> | null {
    const { account, chainId, providerType } = useChainContext()
    const Web3 = useWeb3Connection(pluginID, {
        account,
        chainId,
        providerType,
        ...options,
    })

    const web3Provider = useMemo(() => {
        return Web3.getWeb3Provider()
    }, [Web3])

    return web3Provider || null
}
