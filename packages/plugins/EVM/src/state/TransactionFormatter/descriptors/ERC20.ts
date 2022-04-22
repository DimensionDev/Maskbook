import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'
import { createConnection } from '../../Protocol/connection'
import type { TransactionDescriptor } from '../types'
import { getTokenAmountDescription } from '../utils'

export class ERC20Descriptor implements TransactionDescriptor {
    async compute(context: Web3Plugin.TransactionContext<ChainId>) {
        if (!context.name) return

        const connection = createConnection(context.chainId)

        switch (context.name) {
            case 'approve':
                return {
                    title: 'Approve',
                    description: `Approve spend ${getTokenAmountDescription(
                        context.parameters?.value,
                        await connection.getERC20Token(context.parameters?.to ?? ''),
                    )}`,
                }
            case 'transfer':
            case 'transferFrom':
                return {
                    title: 'Transfer Token',
                    description: `Transfer token ${getTokenAmountDescription(
                        context.parameters?.value,
                        await connection.getERC20Token(context.parameters?.to ?? ''),
                        true,
                    )}`,
                }
            default:
                return
        }
    }
}
