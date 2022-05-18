import { useCallback } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'
import type { Web3Helper } from '../web3-helpers'

export function useRemoveTransactionCallback<T extends NetworkPluginID>(pluginID?: NetworkPluginID) {
    type RemoveTransactions = (
        chainId: Web3Helper.Definition[T]['ChainId'],
        account: string,
        id: string,
    ) =>  Promise<void>

    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID)
    const { Transaction } = useWeb3State(pluginID)

    return useCallback(async (id: string) => {
        if (!account) return
        return (Transaction?.removeTransaction as RemoveTransactions | undefined)?.(chainId, account, id)
    }, [chainId, account, Transaction])
}
