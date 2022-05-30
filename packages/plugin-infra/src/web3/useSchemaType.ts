import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3Connection, Web3Helper } from '../entry-web3'

export function useSchemaType<T extends NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    type GetSchemaType = (
        address: string,
        options?: Web3Helper.Web3ConnectionOptions<T>,
    ) => Promise<Web3Helper.Definition[T]['SchemaType']>

    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!address) return
        return (connection?.getSchemaType as GetSchemaType | undefined)?.(address, options)
    }, [address])
}
