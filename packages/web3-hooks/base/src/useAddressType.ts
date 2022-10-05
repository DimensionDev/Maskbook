import { useAsyncRetry } from 'react-use'

import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useAddressType<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection<S>(pluginID, options)

    return useAsyncRetry<Web3Helper.AddressTypeScope<S, T> | undefined>(async () => {
        if (!address) return
        return connection?.getAddressType?.(address, options)
    }, [address, connection, JSON.stringify(options)])
}
