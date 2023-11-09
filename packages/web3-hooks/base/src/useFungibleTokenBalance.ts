import { noop } from 'lodash-es'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useChainContext } from './useContext.js'
import { useWeb3Connection } from './useWeb3Connection.js'
import { useWeb3State } from './useWeb3State.js'

export function useFungibleTokenBalance<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    address?: string,
    options?: ConnectionOptions<T>,
    /** Allow to control the request */
    enabled = true,
) {
    const { account } = useChainContext({ account: options?.account })
    const Web3 = useWeb3Connection(pluginID, {
        account,
        ...options,
    } as ConnectionOptions<T>)
    const { BalanceNotifier } = useWeb3State(pluginID)

    const result = useQuery({
        enabled,
        queryKey: ['fungible-token', 'balance', pluginID, account, address, options],
        queryFn: async () => {
            if (!address) return '0'
            return Web3.getFungibleTokenBalance(address, undefined, options)
        },
    })

    useEffect(() => {
        return (
            BalanceNotifier?.emitter.on('update', (ev) => {
                if (isSameAddress(account, ev.account)) {
                    result.refetch()
                }
            }) ?? noop
        )
    }, [account, result.refetch, BalanceNotifier])

    return result
}
