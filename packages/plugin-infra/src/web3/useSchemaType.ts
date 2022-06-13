import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3Connection, Web3Helper } from '../entry-web3'

export function useSchemaType<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const connection = useWeb3Connection<S>(pluginID, options)

    return useAsyncRetry<Web3Helper.SchemaTypeScope<S, T> | undefined>(async () => {
        if (!address) return
        return connection?.getSchemaType?.(address, options)
    }, [address])
}
