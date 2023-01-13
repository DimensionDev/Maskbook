import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'

export class SmartPayDescriptor {
    async compute(context: TransactionContext<ChainId, TransactionParameter>) {
        if (!context.isFund) return
        return {
            chainId: context.chainId,
            title: 'Create Smart Pay wallet',
            description: 'Transaction submitted.',
            snackbar: {
                successfulDescription: 'Created a SmartPay wallet on Polygon network.',
                failedDescription: '',
            },
        }
    }
}
