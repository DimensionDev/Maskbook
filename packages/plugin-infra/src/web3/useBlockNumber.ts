import { useAsyncRetry } from 'react-use'
import { useChainId, useWeb3State } from '.'
import type { NetworkPluginID } from '..'

export function useBlockNumber(expectedChainId?: number, pluginID?: NetworkPluginID) {
    const { Provider } = useWeb3State()
    const defaultChainId = useChainId(pluginID)

    const chainId = expectedChainId ?? defaultChainId

    return useAsyncRetry(async () => {
        return Provider?.getLatestBlockNumber(chainId)
    }, [Provider, chainId])
}
