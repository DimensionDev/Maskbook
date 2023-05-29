import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { noop } from 'lodash-es'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useBalance<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T, options?: ConnectionOptions<T>) {
    const { account, chainId } = useChainContext({ account: options?.account })
    const Web3 = useWeb3Connection(pluginID, {
        account,
        chainId,
        ...options,
    })
    const { BalanceNotifier } = useWeb3State(pluginID)

    const asyncResult = useAsyncRetry(async () => {
        if (!account) return '0'
        return Web3.getBalance(account)
    }, [account, Web3])

    useEffect(() => {
        return (
            BalanceNotifier?.emitter.on('update', (ev) => {
                if (isSameAddress(account, ev.account)) asyncResult.retry()
            }) ?? noop
        )
    }, [account, asyncResult.retry, BalanceNotifier])

    return asyncResult
}
