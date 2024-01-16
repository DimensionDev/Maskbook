import { type TransactionContext } from '@masknet/web3-shared-base'
import { type ChainId, type TransactionParameter } from '@masknet/web3-shared-evm'
import { BaseDescriptor } from './Base.js'
import { getTokenAmountDescription } from '../utils.js'
import type { TransactionDescriptor } from '../types.js'
import * as Airdrop from /* webpackDefer: true */ '../../../../../Airdrop/index.js'

export class AirdropDescriptor extends BaseDescriptor implements TransactionDescriptor {
    override async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId>
        if (!context.methods?.length) return

        for (const { name, parameters } of context.methods) {
            if (name === 'claim' && parameters?._eventIndex !== undefined) {
                const result = await Airdrop.Airdrop.getPoolInfo(context.chainId, parameters._eventIndex)
                const token =
                    result?.token ?
                        await this.Hub.getFungibleToken(result.token, { chainId: context.chainId })
                    :   undefined
                return {
                    chainId: context.chainId,
                    title: 'Claim your Airdrop',
                    description: 'Transaction submitted.',
                    snackbar: {
                        successfulDescription: `${getTokenAmountDescription(
                            parameters._amount,
                            token,
                        )} were successfully claimed`,
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
