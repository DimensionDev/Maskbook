import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { noop } from 'lodash-unified'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useChainId } from './useChainId'
import { useWeb3Connection } from './useWeb3Connection'
import { useWeb3State } from '../entry-web3'

export function useBlockNumber<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const chainId = useChainId(pluginID, options?.chainId)
    const connection = useWeb3Connection(pluginID, options)
    const { BlockNumberNotifier } = useWeb3State(pluginID)

    const asyncRetry = useAsyncRetry(async () => {
        if (!connection) return 0
        return connection.getBlockNumber()
    }, [chainId, connection])

    useEffect(() => {
        return (
            BlockNumberNotifier?.emitter.on('update', (actualChainId) => {
                if (actualChainId === chainId) asyncRetry.retry()
            }) ?? noop
        )
    }, [chainId, asyncRetry.retry, BlockNumberNotifier])

    return asyncRetry
}
