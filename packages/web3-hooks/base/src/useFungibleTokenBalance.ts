import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { noop } from 'lodash-es'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useFungibleTokenBalance<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const { account } = useChainContext({ account: options?.account })
    const connection = useWeb3Connection(pluginID, options)
    const { BalanceNotifier } = useWeb3State(pluginID)

    const asyncRetry = useAsyncRetry(async () => {
        if (!connection || !address) return '0'
        return connection.getFungibleTokenBalance(address ?? '', undefined, options)
    }, [address, connection, JSON.stringify(options)])

    useEffect(() => {
        return (
            BalanceNotifier?.emitter.on('update', (ev) => {
                if (isSameAddress(account, ev.account)) {
                    asyncRetry.retry()
                }
            }) ?? noop
        )
    }, [account, asyncRetry.retry, BalanceNotifier])

    return asyncRetry
}
