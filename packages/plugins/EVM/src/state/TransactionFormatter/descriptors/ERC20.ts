import { TransactionContext, isZero } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types'
import { getTokenAmountDescription } from '../utils'
import { Web3StateSettings } from '../../../settings'

export class ERC20Descriptor implements TransactionDescriptor {
    async compute(context: TransactionContext<ChainId>) {
        if (!context.name) return

        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId: context.chainId,
        })
        switch (context.name) {
            case 'approve':
                if (isZero(context.value)) {
                    return {
                        chainId: context.chainId,
                        title: 'Revoke',
                        description: 'Revoke the approval for the token.',
                        successfulDescription: 'Revoke the approval successfully.',
                    }
                }

                return {
                    chainId: context.chainId,
                    title: 'Approve',
                    description: `Approve spend ${getTokenAmountDescription(
                        context.parameters?.value as string,
                        await connection?.getFungibleToken(context.to ?? '', {
                            chainId: context.chainId,
                        }),
                    )}`,
                }
            case 'transfer':
            case 'transferFrom':
                return {
                    chainId: context.chainId,
                    title: 'Transfer Token',
                    description: `Transfer token ${getTokenAmountDescription(
                        context.parameters?.value as string,
                        await connection?.getFungibleToken(context.to ?? '', {
                            chainId: context.chainId,
                        }),
                        true,
                    )}`,
                }
            default:
                return
        }
    }
}
