import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useWeb3Connection } from './useWeb3Connection'

export function useBalance<T extends NetworkPluginID>(pluginID?: T, options?: Web3Helper.Web3ConnectionOptions<T>) {
    type GetBalance = (account: string, options?: Web3Helper.Web3ConnectionOptions<T>) => Promise<string>

    const account = useAccount(pluginID, options?.account)
    const connection = useWeb3Connection(pluginID, options)

    return useAsyncRetry(async () => {
        if (!connection) return '0'
        return (connection.getBalance as GetBalance)(account)
    }, [account, connection])
}
