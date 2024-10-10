import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { BaseDescriptor } from './Base.js'
import type { TransactionDescriptorFormatResult } from '../types.js'

export class SmartPayDescriptor extends BaseDescriptor {
    override async compute(
        context_: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorFormatResult | undefined> {
        const context = context_ as TransactionContext<ChainId>
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
                        popup: {
                            method: name,
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
                        popup: {
                            method: name,
                        },
                    }
                case 'changeOwner':
                    return {
                        chainId: context.chainId,
                        title: 'Change Owner',
                        description: 'Transaction submitted.',
                        snackbar: {
                            successfulDescription: 'Owner changed.',
                            failedDescription: '',
                        },
                        popup: {
                            method: name,
                        },
                    }
                default:
                    continue
            }
        }
        return
    }
}
