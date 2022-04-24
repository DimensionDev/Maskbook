import { useAsyncRetry } from 'react-use'
import { useChainId, useWeb3State, Web3Helper } from '../entry-web3'
import type { NetworkPluginID } from '../web3-types'

export function useBlockNumber<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const { Protocol } = useWeb3State(pluginID)
    const chainId = useChainId(pluginID, expectedChainId)

    return useAsyncRetry(async () => {
        return Protocol?.getLatestBlockNumber?.({
            // @ts-ignore
            chainId,
        })
    }, [chainId, Protocol?.getLatestBlockNumber])
}
