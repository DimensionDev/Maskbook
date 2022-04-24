import { useAsyncRetry } from 'react-use'
import { useWeb3State, useAccount, Web3Helper } from '../entry-web3'
import type { NetworkPluginID } from '../web3-types'

export function useBalance<T extends NetworkPluginID>(
    pluginID?: T,
    expectedAccount?: string,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    const { Protocol } = useWeb3State(pluginID)
    const account = useAccount(pluginID, expectedAccount)

    return useAsyncRetry(async () => {
        // @ts-ignore
        return Protocol?.getLatestBalance?.(account, options) ?? '0'
    }, [account, options, Protocol])
}
