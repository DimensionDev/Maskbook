import {
    type ChainId,
    EthereumMethodType,
    isZeroAddress,
    type TransactionParameter,
    type Middleware,
} from '@masknet/web3-shared-evm'
import { isSameAddress, type TransactionContext, TransactionDescriptorType } from '@masknet/web3-shared-base'
import { Web3StateRef } from '../apis/Web3StateAPI.js'
import type { ConnectionContext } from '../libs/ConnectionContext.js'

export class AddressBook implements Middleware<ConnectionContext> {
    private getFrom(context?: TransactionContext<ChainId, TransactionParameter>) {
        return context?.from
    }

    private getTo(context?: TransactionContext<ChainId, TransactionParameter>) {
        if (!context) return
        switch (context.type) {
            case TransactionDescriptorType.TRANSFER:
                return context.to
            case TransactionDescriptorType.INTERACTION:
                const method = context.methods?.find(
                    (x) => x.name && ['transfer', 'transferFrom'].includes(x.name) && x.parameters?.to,
                )
                return method?.parameters?.to
        }
        return
    }

    async fn(context: ConnectionContext, next: () => Promise<void>) {
        await next()

        if (context.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return
        if (!context.config) return

        try {
            const { AddressBook, TransactionFormatter } = Web3StateRef.value
            const formatContext = await TransactionFormatter?.createContext(context.chainId, context.config)
            const from = this.getFrom(formatContext)
            const to = this.getTo(formatContext) as string

            if (!isSameAddress(from, to) && !isZeroAddress(to) && to) await AddressBook?.addAddress(context.chainId, to)
        } catch {
            // to scan the context for available recipient address, allow to fail silently.
        }
    }
}
