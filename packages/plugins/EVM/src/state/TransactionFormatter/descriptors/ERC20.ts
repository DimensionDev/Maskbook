import { TransactionContext, isZero } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types'
import { getTokenAmountDescription } from '../utils'
import { Web3StateSettings } from '../../../settings'

export class ERC20Descriptor implements TransactionDescriptor {
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId, string | undefined>
        if (!context.methods?.length) return

        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId: context.chainId,
        })
        for (const method of context.methods) {
            const parameters = method.parameters

            switch (method.name) {
                case 'approve':
                    if (parameters?.spender === undefined || parameters?.value === undefined) break

                    if (isZero(parameters?.value)) {
                        return {
                            chainId: context.chainId,
                            title: 'Revoke',
                            description: 'Revoke the approval for the token.',
                            successfulDescription: 'Revoke the approval successfully.',
                            failedDescription: 'Revoke requestion rejected.',
                        }
                    }

                    return {
                        chainId: context.chainId,
                        title: 'Approve',
                        description: `Approve spend ${getTokenAmountDescription(
                            parameters?.value,
                            await connection?.getFungibleToken(context.to ?? '', {
                                chainId: context.chainId,
                            }),
                        )}`,
                    }
            }

            if ((method.name === 'transfer' || method.name === 'transferFrom') && parameters?.to && parameters?.value) {
                return {
                    chainId: context.chainId,
                    title: 'Transfer Token',
                    description: `Transfer token ${getTokenAmountDescription(
                        parameters?.value,
                        await connection?.getFungibleToken(context.to ?? '', {
                            chainId: context.chainId,
                        }),
                        true,
                    )}`,
                }
            }
        }

        return
    }
}
