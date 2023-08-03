import { Airdrop } from '@masknet/web3-providers'
import { isSameAddress, type TransactionContext } from '@masknet/web3-shared-base'
import { getITOConstants, type ChainId, type TransactionParameter } from '@masknet/web3-shared-evm'
import { BaseDescriptor } from './Base.js'
import { getTokenAmountDescription } from '../utils.js'
import type { TransactionDescriptor } from '../types.js'

export class AirdropDescriptor extends BaseDescriptor implements TransactionDescriptor {
    override async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId>
        const { ITO2_CONTRACT_ADDRESS } = getITOConstants(context.chainId)
        if (!context.methods?.length || isSameAddress(context.to, ITO2_CONTRACT_ADDRESS)) return

        for (const { name, parameters } of context.methods) {
            if (name === 'claim' && parameters?._eventIndex !== undefined) {
                const result = await Airdrop.getPoolInfo(context.chainId, parameters._eventIndex)
                const token = result?.token
                    ? await this.Hub.getFungibleToken(result.token, { chainId: context.chainId })
                    : undefined
                return {
                    chainId: context.chainId,
                    title: 'Claim your Airdrop',
                    description: 'Transaction submitted.',
                    snackbar: {
                        successfulDescription: `${getTokenAmountDescription(
                            parameters?._amount,
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
