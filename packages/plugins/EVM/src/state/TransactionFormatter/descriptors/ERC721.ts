import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types'

export class ERC721Descriptor implements TransactionDescriptor {
    async compute(context: TransactionContext<ChainId>) {
        if (!context.methods?.length) return

        for (const method of context.methods) {
            const parameters = method.parameters

            switch (method.name) {
                case 'setApprovalForAll':
                    if (parameters?.operator === undefined || parameters?.approved === undefined) break
                    return {
                        chainId: context.chainId,
                        title: parameters?.approved === false ? 'Revoke' : 'Unlock',
                        description: `${
                            parameters?.approved === false ? 'Revoke the approval for' : 'Unlock'
                        } the token.`,
                        successfulDescription: 'Revoke the approval successfully.',
                    }

                default:
                    return
            }
        }

        return
    }
}
