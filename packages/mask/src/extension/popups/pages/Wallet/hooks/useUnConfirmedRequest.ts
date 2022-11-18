import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { WalletMessages } from '@masknet/plugin-wallet'
import { getPayloadConfig } from '@masknet/web3-shared-evm'
import { useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { WalletRPC } from '../../../../../plugins/Wallet/messages.js'

export const useUnconfirmedRequest = () => {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { TransactionFormatter } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const result = useAsyncRetry(async () => {
        const payload = await WalletRPC.topUnconfirmedRequest()
        if (!payload) return

        const computedPayload = getPayloadConfig(payload)
        if (!computedPayload) return { payload }

        const formatterTransaction = await TransactionFormatter?.formatTransaction(chainId, computedPayload)
        const transactionContext = await TransactionFormatter?.createContext(chainId, computedPayload)
        return {
            payload,
            computedPayload,
            formatterTransaction,
            transactionContext,
        }
    }, [chainId, TransactionFormatter])

    useEffect(() => {
        return WalletMessages.events.requestsUpdated.on(result.retry)
    }, [result.retry])

    return result
}
