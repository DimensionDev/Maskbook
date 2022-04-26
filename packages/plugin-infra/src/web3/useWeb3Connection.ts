import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'

export function useWeb3Connection<T extends NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    type GetConnection = (options?: Web3Helper.Web3ConnectionOptions<T>) => Promise<Web3Helper.Web3Connection<T>>

    const { Protocol } = useWeb3State(pluginID)

    const { value: connection = null } = useAsyncRetry(async () => {
        if (!Protocol?.getConnection) return
        return (Protocol.getConnection as GetConnection)(options)
    }, [options, Protocol])

    return connection
}
