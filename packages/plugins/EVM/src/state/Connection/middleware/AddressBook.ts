import {
    ChainId,
    EthereumMethodType,
    isZeroAddress,
    TransactionParameter,
    Middleware,
    ConnectionContext,
} from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings/index.js'
import { isSameAddress, TransactionContext, TransactionDescriptorType } from '@masknet/web3-shared-base'

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
        const { AddressBook } = Web3StateSettings.value

        await next()

        if (context.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return
        if (!context.config) return

        try {
            const { TransactionFormatter } = Web3StateSettings.value
            const formatContext = await TransactionFormatter?.createContext(context.chainId, context.config)
            const from = this.getFrom(formatContext)
            const to = this.getTo(formatContext) as string

            if (!isSameAddress(from, to) && !isZeroAddress(to) && to) await AddressBook?.addAddress(context.chainId, to)
        } catch {
            // to scan the context for available recipient address, allow to fail silently.
        }
    }
}
