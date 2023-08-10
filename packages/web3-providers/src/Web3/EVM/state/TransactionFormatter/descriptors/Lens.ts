import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { BaseDescriptor } from './Base.js'
import type { TransactionDescriptor } from '../types.js'

export class LensDescriptor extends BaseDescriptor implements TransactionDescriptor {
    override async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId>
        if (!context.methods?.length) return

        for (const { name } of context.methods) {
            switch (name) {
                case 'followWithSig':
                    return {
                        chainId: context.chainId,
                        title: 'Follow User',
                        description: 'Transaction submitted.',
                        snackbar: {
                            failedDescription: 'Transaction was Rejected!',
                        },
                        popup: {
                            method: name,
                        },
                    }
            }
        }
        return
    }
}
