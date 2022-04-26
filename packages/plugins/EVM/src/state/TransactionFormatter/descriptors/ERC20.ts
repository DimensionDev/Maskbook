import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types'
import { getTokenAmountDescription } from '../utils'
import { Web3StateSettings } from '../../../settings'

export class ERC20Descriptor implements TransactionDescriptor {
    async compute(context: TransactionContext<ChainId>) {
        if (!context.name) return

        const connection = await Web3StateSettings.value.Protocol?.getConnection?.({
            chainId: context.chainId,
        })

        switch (context.name) {
            case 'approve':
                return {
                    chainId: context.chainId,
                    title: 'Approve',
                    description: `Approve spend ${getTokenAmountDescription(
                        context.parameters?.value,
                        await connection?.getFungibleToken(context.parameters?.to ?? '', {
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
                        context.parameters?.value,
                        await connection?.getFungibleToken(context.parameters?.to ?? '', {
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
