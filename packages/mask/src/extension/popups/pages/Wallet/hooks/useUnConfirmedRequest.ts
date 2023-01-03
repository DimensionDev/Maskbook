import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { WalletMessages } from '@masknet/plugin-wallet'
import { PayloadEditor } from '@masknet/web3-shared-evm'
import { useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import { ECKeyIdentifier, NetworkPluginID } from '@masknet/shared-base'
import { WalletRPC } from '../../../../../plugins/Wallet/messages.js'
import { omit } from 'lodash-es'
import type { JsonRpcPayload } from 'web3-core-helpers'

export const useUnconfirmedRequest = () => {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { TransactionFormatter } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const result = useAsyncRetry(async () => {
        const payload = await WalletRPC.topUnconfirmedRequest()
        if (!payload) return

        const computedPayload = PayloadEditor.fromPayload(payload).config!
        const formatterTransaction = await TransactionFormatter?.formatTransaction(chainId, computedPayload)
        const transactionContext = await TransactionFormatter?.createContext(chainId, computedPayload)
        return {
            owner: payload.owner,
            identifier: payload.identifier ? ECKeyIdentifier.from(payload.identifier).unwrap() : undefined,
            payload: omit(payload, 'owner', 'identifier') as JsonRpcPayload,
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
