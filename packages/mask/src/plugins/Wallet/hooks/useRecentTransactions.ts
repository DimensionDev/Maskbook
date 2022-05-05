import { NetworkPluginID, useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useAccount, useChainId } from '@masknet/web3-shared-evm'
import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../messages'
import type { RecentTransactionOptions } from '../services'

export function useRecentTransactions(options?: RecentTransactionOptions) {
    const account = useAccount()
    const chainId = useChainId()
    const pluginId = useCurrentWeb3NetworkPluginID()

    const result = useAsyncRetry(async () => {
        // Show recent evm transactions only.
        if (!account || pluginId !== NetworkPluginID.PLUGIN_EVM) return []
        return WalletRPC.getRecentTransactions(chainId, account, options)
    }, [chainId, account, JSON.stringify(options), pluginId])

    useEffect(() => WalletMessages.events.transactionStateUpdated.on(result.retry), [result.retry])
    useEffect(() => WalletMessages.events.transactionsUpdated.on(result.retry), [result.retry])

    return result
}
