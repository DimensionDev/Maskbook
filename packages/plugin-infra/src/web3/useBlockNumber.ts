import { useAsyncRetry } from 'react-use'
import { useChainId, useWeb3State } from '.'
import type { NetworkPluginID } from '../web3-types'

export function useBlockNumber(expectedChainId?: number, pluginID?: NetworkPluginID) {
    const { Protocol } = useWeb3State(pluginID)
    const defaultChainId = useChainId(pluginID)

    const chainId = expectedChainId ?? defaultChainId

    return useAsyncRetry(async () => {
        return Protocol?.getLatestBlockNumber?.(chainId)
    }, [Protocol?.getLatestBlockNumber, chainId])
}
