import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { getTokenAmountDescription } from '../utils.js'
import type { TransactionDescriptorFormatResult } from '../types.js'
import { BaseDescriptor } from './Base.js'

export class TransferTokenDescriptor extends BaseDescriptor {
    override async compute(
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorFormatResult | undefined> {
        const token = await this.Web3.getNativeToken({
            chainId: context.chainId,
        })

        return {
            chainId: context.chainId,
            title: 'Transfer Token',
            description: { key: 'Send {token}', token: getTokenAmountDescription(context.value, token) },
            snackbar: {
                successfulDescription: {
                    key: '{token} sent.',
                    token: getTokenAmountDescription(context.value, token),
                },
                failedDescription: 'Failed to send token.',
            },
        }
    }
}
