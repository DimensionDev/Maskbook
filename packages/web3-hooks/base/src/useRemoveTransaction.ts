import { useCallback } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from './useContext.js'
import { useWeb3State } from './useWeb3State.js'

export function useRemoveTransactionCallback(pluginID?: NetworkPluginID) {
    const { account, chainId } = useChainContext()
    const { Transaction } = useWeb3State(pluginID)

    return useCallback(
        async (id: string) => {
            if (!account) return
            await Transaction?.removeTransaction?.(chainId, account, id)
        },
        [chainId, account, Transaction],
    )
}
