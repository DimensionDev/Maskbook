import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'

export function useWeb3<T extends NetworkPluginID>(pluginID?: T, options?: Web3Helper.Web3ConnectionOptions<T>) {
    type GetWeb3 = (options?: Web3Helper.Web3ConnectionOptions<T>) => Promise<Web3Helper.Web3<T>>

    const { Protocol } = useWeb3State(pluginID)

    const { value: web3 = null } = useAsyncRetry(async () => {
        if (!Protocol?.getWeb3) return null
        return (Protocol.getWeb3 as GetWeb3)(options)
    }, [options, Protocol])

    return web3
}
