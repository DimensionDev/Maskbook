import { useMemo } from 'react'
import { NetworkPluginID, useWeb3State, Web3Helper } from '../entry-web3'

export function useWeb3Connection<T extends NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    const { Protocol } = useWeb3State(pluginID)

    return useMemo(() => {
        // @ts-ignore
        return Protocol?.getConnection?.(options) ?? null
    }, [options, Protocol])
}
