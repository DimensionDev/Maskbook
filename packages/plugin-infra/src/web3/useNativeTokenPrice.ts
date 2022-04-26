import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'

export function useNativeTokenPrice<T extends NetworkPluginID>(
    pluginID: T,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    return useAsyncRetry(async () => {
        return 0
    })
}
