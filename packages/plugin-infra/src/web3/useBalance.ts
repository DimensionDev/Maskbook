import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { noop } from 'lodash-unified'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useWeb3Connection } from './useWeb3Connection'
import { useWeb3State } from '../entry-web3'

export function useBalance<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const account = useAccount(pluginID, options?.account)
    const chainId = useChainId(pluginID, options?.chainId)
    const connection = useWeb3Connection(pluginID, options)
    const { BalanceNotifier, Others } = useWeb3State(pluginID)

    const asyncResult = useAsyncRetry(async () => {
        if (!account || !connection) return '0'
        return connection.getBalance(account)
    }, [account, chainId, connection])

    useEffect(() => {
        return (
            BalanceNotifier?.emitter.on('update', (ev) => {
                if (Others?.isSameAddress(account, ev.account)) asyncResult.retry()
            }) ?? noop
        )
    }, [account, asyncResult.retry, BalanceNotifier, Others])

    return asyncResult
}
