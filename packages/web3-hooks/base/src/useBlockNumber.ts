import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { noop } from 'lodash-es'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3Connection } from './useWeb3Connection.js'
import { useWeb3State } from './useWeb3State.js'

export function useBlockNumber<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: ConnectionOptions<T>,
) {
    const { chainId } = useChainContext({ chainId: options?.chainId })
    const Web3 = useWeb3Connection(pluginID, {
        chainId,
        ...options,
    } as ConnectionOptions<T>)
    const { BlockNumberNotifier } = useWeb3State(pluginID)

    const asyncRetry = useAsyncRetry(async () => {
        return Web3.getBlockNumber()
    }, [chainId, Web3])

    useEffect(() => {
        return (
            BlockNumberNotifier?.emitter.on('update', (actualChainId) => {
                if (actualChainId === chainId) asyncRetry.retry()
            }) ?? noop
        )
    }, [chainId, asyncRetry.retry, BlockNumberNotifier])

    return asyncRetry
}
