import type { TransactionContext } from '@masknet/web3-shared-base'
import { i18NextInstance } from '@masknet/shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { getTokenAmountDescription } from '../utils.js'
import type { TransactionDescriptor } from '../types.js'
import { BaseDescriptor } from './Base.js'

export class TransferTokenDescriptor extends BaseDescriptor implements TransactionDescriptor {
    override async compute(context: TransactionContext<ChainId, TransactionParameter>) {
        const Web3 = this.useConnection()
        const token = await Web3?.getNativeToken({
            chainId: context.chainId,
        })

        return {
            chainId: context.chainId,
            title: i18NextInstance.t('plugin_infra_descriptor_token_transfer_title'),
            description: i18NextInstance.t('plugin_infra_descriptor_token_transfer', {
                tokenAmountDescription: getTokenAmountDescription(context.value, token),
            }),
            snackbar: {
                successfulDescription: i18NextInstance.t('plugin_infra_descriptor_token_transfer_success', {
                    tokenAmountDescription: getTokenAmountDescription(context.value, token),
                }),
                failedDescription: i18NextInstance.t('plugin_infra_descriptor_token_transfer_fail'),
            },
        }
    }
}
