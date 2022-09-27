import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { noop } from 'lodash-unified'
import { useEffect } from 'react'
import useAsyncRetry from 'react-use/lib/useAsyncRetry'
import { useWeb3State } from '../entry-web3.js'
import { useAccount } from './useAccount.js'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useFungibleTokenBalance<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const account = useAccount(pluginID, options?.account)
    const connection = useWeb3Connection(pluginID, options)
    const { BalanceNotifier, Others } = useWeb3State(pluginID)

    const asyncRetry = useAsyncRetry(async () => {
        if (!connection) return '0'
        return connection.getFungibleTokenBalance(address ?? '', options)
    }, [address, connection, JSON.stringify(options)])

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
