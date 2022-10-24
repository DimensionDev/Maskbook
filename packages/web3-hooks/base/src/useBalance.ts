import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { noop } from 'lodash-unified'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'
import { useWeb3Connection } from './useWeb3Connection.js'
import { useWeb3State } from './useWeb3State.js'

export function useBalance<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const { account, chainId } = useChainContext({ account: options?.account })
    const connection = useWeb3Connection(pluginID, options)
    const { BalanceNotifier } = useWeb3State(pluginID)

    const asyncResult = useAsyncRetry(async () => {
        if (!account || !connection) return '0'
        return connection.getBalance(account)
    }, [account, chainId, connection])

    useEffect(() => {
        return (
            BalanceNotifier?.emitter.on('update', (ev) => {
                if (isSameAddress(account, ev.account)) asyncResult.retry()
            }) ?? noop
        )
    }, [account, asyncResult.retry, BalanceNotifier])

    return asyncResult
}
