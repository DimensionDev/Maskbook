import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { noop } from 'lodash-es'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useFungibleTokenBalance<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: ConnectionOptions<T>,
) {
    const { account } = useChainContext({ account: options?.account })
    const Web3 = useWeb3Connection(pluginID, {
        account,
        ...options,
    })
    const { BalanceNotifier } = useWeb3State(pluginID)

    const asyncRetry = useAsyncRetry(async () => {
        if (!address) return '0'
        return Web3.getFungibleTokenBalance(address ?? '', undefined)
    }, [address, Web3])

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
