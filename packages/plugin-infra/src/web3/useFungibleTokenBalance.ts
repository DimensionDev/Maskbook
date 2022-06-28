import { useEffect } from 'react'
import useAsyncRetry from 'react-use/lib/useAsyncRetry'
import { noop } from 'lodash-unified'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from '../entry-web3'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useWeb3Connection } from './useWeb3Connection'

export function useFungibleTokenBalance<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const account = useAccount(pluginID, options?.account)
    const chainId = useChainId(pluginID, options?.chainId)
    const connection = useWeb3Connection(pluginID, options)
    const { BalanceNotifier, Others } = useWeb3State(pluginID)

    const asyncRetry = useAsyncRetry(async () => {
        if (!connection) return '0'
        return connection.getFungibleTokenBalance(address ?? '', options)
    }, [account, address, chainId, connection, JSON.stringify(options)])

    useEffect(() => {
        return (
            BalanceNotifier?.emitter.on('update', (ev) => {
                if (Others?.isSameAddress(account, ev.account)) {
                    asyncRetry.retry()
                }
            }) ?? noop
        )
    }, [account, asyncRetry.retry, BalanceNotifier, Others])

    return asyncRetry
}
