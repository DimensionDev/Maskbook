import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { NetworkPluginID, useAccount, useChainId } from '@masknet/plugin-infra'
import { WalletMessages } from '@masknet/plugin-wallet'
import { PluginServices } from '../../../API'
import type { RecentTransactionOptions } from '../../../../../mask/src/plugins/Wallet/services'

// todo: should merge in plugin infra package when plugin infra ready
export function useRecentTransactions(options?: RecentTransactionOptions) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    const result = useAsyncRetry(async () => {
        if (!account) return []
        return PluginServices.Wallet.getRecentTransactions(chainId, account, options)
    }, [chainId, account, JSON.stringify(options)])

    useEffect(() => WalletMessages.events.transactionsUpdated.on(result.retry), [result.retry])
    useEffect(() => WalletMessages.events.transactionProgressUpdated.on(result.retry), [result.retry])

    return result
}
