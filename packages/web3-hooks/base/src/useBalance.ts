import { useEffect } from 'react'
import { noop } from 'lodash-es'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'
import { useWeb3Connection } from './useWeb3Connection.js'
import { useQuery } from '@tanstack/react-query'

export function useBalance<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T, options?: ConnectionOptions<T>) {
    const { account, chainId } = useChainContext({ account: options?.account })
    const Web3 = useWeb3Connection(pluginID, {
        account,
        chainId,
        ...options,
    })
    const { BalanceNotifier } = useWeb3State(pluginID)

    const result = useQuery({
        enabled: !!account,
        queryKey: ['balance', pluginID, chainId, account, options],
        queryFn: async () => {
            if (!account) return 0
            return Web3.getBalance(account)
        },
    })

    useEffect(() => {
        return (
            BalanceNotifier?.emitter.on('update', (ev) => {
                if (isSameAddress(account, ev.account)) result.refetch()
            }) ?? noop
        )
    }, [account, result.refetch, BalanceNotifier])

    return result
}
