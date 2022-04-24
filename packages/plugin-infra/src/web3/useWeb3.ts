import { useMemo } from 'react'
import { NetworkPluginID, useWeb3State, Web3Helper } from '../entry-web3'

export function useWeb3<T extends NetworkPluginID>(
    expectedPluginID?: T,
    options?: Web3Helper.Web3ConnectionOptions<T>,
) {
    const { Protocol } = useWeb3State(expectedPluginID)
    return useMemo(() => {
        // @ts-ignore
        return Protocol?.getWeb3?.(options) ?? null
    }, [options, Protocol])
}
