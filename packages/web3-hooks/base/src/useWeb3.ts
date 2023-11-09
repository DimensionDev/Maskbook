import { useMemo } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useWeb3<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: ConnectionOptions<T>,
): Web3Helper.Web3Scope<S, T> | null {
    const { account, chainId, providerType } = useChainContext()
    const Web3 = useWeb3Connection(pluginID, {
        account,
        chainId,
        providerType,
        ...options,
    } as ConnectionOptions<T>)

    const web3 = useMemo(() => {
        return Web3.getWeb3()
    }, [Web3])

    return web3 || null
}
