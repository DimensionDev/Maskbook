import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useEffect } from 'react'
import { WalletMessages } from '@masknet/plugin-wallet'
import { getPayloadConfig } from '@masknet/web3-shared-evm'
import { useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export const useUnconfirmedRequest = () => {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
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
