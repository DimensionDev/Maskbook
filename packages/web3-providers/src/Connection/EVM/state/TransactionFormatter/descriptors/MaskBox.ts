import type { AbiItem } from 'web3-utils'
import { i18NextInstance } from '@masknet/shared-base'
import { type TransactionContext, isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId, getMaskBoxConstants, type TransactionParameter } from '@masknet/web3-shared-evm'
import MaskBox_ABI from '@masknet/web3-contracts/abis/MaskBox.json'
import type { TransactionDescriptor } from '../types.js'
import { DescriptorWithTransactionDecodedReceipt, getTokenAmountDescription } from '../utils.js'
import { Web3StateRef } from '../../../apis/Web3StateAPI.js'

export class MaskBoxDescriptor extends DescriptorWithTransactionDecodedReceipt implements TransactionDescriptor {
    async getPurchaseTokenInfo(chainId: ChainId, contractAddress: string | undefined, hash: string | undefined) {
        const hub = Web3StateRef.value.Hub?.getHub?.({
            chainId,
        })

        const events = await this.getReceipt(chainId, contractAddress, MaskBox_ABI as AbiItem[], hash)

        const { amount, token_address } = (events?.ClaimPayment?.returnValues ?? {}) as {
            amount: string
            token_address: string
        }

        if (!token_address) return

        const token = await hub?.getFungibleToken?.(token_address ?? '', { chainId })

        if (!token) return

        return getTokenAmountDescription(amount, token)
    }
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId>

        const { MASK_BOX_CONTRACT_ADDRESS } = getMaskBoxConstants(context.chainId)
        if (!isSameAddress(context.to, MASK_BOX_CONTRACT_ADDRESS)) return
        const method = context.methods?.find((x) => ['claimPayment'].includes(x.name ?? ''))

        if (method?.name === 'claimPayment') {
            return {
                chainId: context.chainId,
                title: i18NextInstance.t('plugin_infra_descriptor_mask_box_purchase_title'),
                description: i18NextInstance.t('plugin_infra_descriptor_mask_box_purchase'),
                snackbar: {
                    successfulDescription: i18NextInstance.t('plugin_infra_descriptor_mask_box_purchase_success', {
                        tokenAmountDescription: await this.getPurchaseTokenInfo(
                            context.chainId,
                            MASK_BOX_CONTRACT_ADDRESS,
                            context.hash,
                        ),
                    }),
                    failedDescription: i18NextInstance.t('plugin_infra_descriptor_mask_box_purchase_fail'),
                },
            }
        }
        return
    }
}
