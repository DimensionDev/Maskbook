import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'

export class SmartPayDescriptor {
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId, string | undefined>
        if (!context.methods?.length) return

        for (const { name, parameters } of context.methods) {
            switch (name) {
                case 'fund':
                    if (!parameters?.owner || !parameters.nonce) break
                    return {
                        chainId: context.chainId,
                        title: 'Create Smart Pay wallet',
                        description: 'Transaction submitted.',
                        snackbar: {
                            successfulDescription: 'Created a SmartPay wallet on Polygon network.',
                            failedDescription: '',
                        },
                    }
                case 'deploy':
                    return {
                        chainId: context.chainId,
                        title: 'Deploy Smarty Pay wallet',
                        description: 'Transaction submitted.',
                        snackbar: {
                            successfulDescription: 'Deploy a SmartPay wallet on Polygon network.',
                            failedDescription: '',
                        },
                    }
                default:
                    continue
            }
        }
        return
    }
}
