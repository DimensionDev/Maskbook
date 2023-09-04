import { omit } from 'lodash-es'
import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { PayloadEditor } from '@masknet/web3-shared-evm'
import { useChainContext, useNativeTokenAddress, useWeb3State } from '@masknet/web3-hooks-base'
import { CrossIsolationMessages, ECKeyIdentifier, NetworkPluginID } from '@masknet/shared-base'
import Services from '#services'

export const useUnconfirmedRequest = () => {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { TransactionFormatter } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const nativeTokenAddress = useNativeTokenAddress()

    const result = useAsyncRetry(async () => {
        const payload = await Services.Wallet.topUnconfirmedRequest()
        if (!payload) return

        const computedPayload = PayloadEditor.fromPayload(payload).config
        const formatterTransaction = await TransactionFormatter?.formatTransaction(chainId, computedPayload)
        const transactionContext = await TransactionFormatter?.createContext(chainId, computedPayload)
        return {
            owner: payload.owner,
            identifier: payload.identifier ? ECKeyIdentifier.from(payload.identifier).unwrapOr(undefined) : undefined,
            paymentToken: payload.paymentToken,
            allowMaskAsGas: payload.allowMaskAsGas,
            payload: omit(payload, 'owner', 'identifier', 'paymentToken') as JsonRpcPayload,
            computedPayload,
            formatterTransaction,
            transactionContext,
        }
    }, [chainId, TransactionFormatter, nativeTokenAddress])

    useEffect(() => {
        return CrossIsolationMessages.events.requestsUpdated.on(result.retry)
    }, [result.retry])

    return result
}
