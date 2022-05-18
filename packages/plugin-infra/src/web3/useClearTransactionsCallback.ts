import { useCallback } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'
import type { Web3Helper } from '../web3-helpers'

export function useClearTransactionsCallback<T extends NetworkPluginID>(pluginID?: NetworkPluginID) {
    type ClearTransactions = (
        chainId: Web3Helper.Definition[T]['ChainId'],
        account: string,
    ) =>  Promise<void>

    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID)
    const { Transaction } = useWeb3State(pluginID)

    return useCallback(async () => {
        if (!account) return
        return (Transaction?.clearTransactions as ClearTransactions | undefined)?.(chainId, account)
    }, [chainId, account, Transaction])
}
