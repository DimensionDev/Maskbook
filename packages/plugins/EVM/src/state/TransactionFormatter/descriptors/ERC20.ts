import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types'
import { getTokenAmountDescription } from '../utils'
import { Web3StateSettings } from '../../../settings'

export class ERC20Descriptor implements TransactionDescriptor {
    async compute(context: TransactionContext<ChainId>) {
        if (!context.methods?.length) return

        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId: context.chainId,
        })

        for (const method of context.methods) {
            const parameters = method.parameters
            if (method.name === 'approve' && parameters?.spender && parameters?.value) {
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
                        method.parameters?.value,
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
