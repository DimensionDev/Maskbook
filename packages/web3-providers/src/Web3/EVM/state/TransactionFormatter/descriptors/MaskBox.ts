import type { AbiItem } from 'web3-utils'
import { type TransactionContext, isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId, getMaskBoxConstants, type TransactionParameter } from '@masknet/web3-shared-evm'
import MaskBox_ABI from '@masknet/web3-contracts/abis/MaskBox.json'
import type { TransactionDescriptorFormatResult } from '../types.js'
import { DescriptorWithTransactionDecodedReceipt, getTokenAmountDescription } from '../utils.js'

export class MaskBoxDescriptor extends DescriptorWithTransactionDecodedReceipt {
    async getPurchaseTokenInfo(chainId: ChainId, contractAddress: string | undefined, hash: string | undefined) {
        const events = await this.getReceipt(chainId, contractAddress, MaskBox_ABI as AbiItem[], hash)

        const { amount, token_address } = (events?.ClaimPayment?.returnValues ?? {}) as {
            amount: string
            token_address: string
        }
        if (!token_address) return

        const token = await this.Hub.getFungibleToken(token_address ?? '', { chainId })
        if (!token) return

        return getTokenAmountDescription(amount, token)
    }

    override async compute(
        context_: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorFormatResult | undefined> {
        const context = context_ as TransactionContext<ChainId>

        const { MASK_BOX_CONTRACT_ADDRESS } = getMaskBoxConstants(context.chainId)
        if (!isSameAddress(context.to, MASK_BOX_CONTRACT_ADDRESS)) return
        const method = context.methods?.find((x) => ['claimPayment'].includes(x.name ?? ''))

        if (method?.name === 'claimPayment') {
            const token = await this.getPurchaseTokenInfo(context.chainId, MASK_BOX_CONTRACT_ADDRESS, context.hash)
            return {
                chainId: context.chainId,
                title: 'Purchase Maskbox NFT',
                description: 'Purchase Maskbox NFT.',
                snackbar: {
                    successfulDescription:
                        token ?
                            { key: 'Purchase Maskbox NFT with {token} successfully.', token }
                        :   'Purchase Maskbox NFT successfully.',
                    failedDescription: 'Failed to purchase Maskbox NFT.',
                },
                popup: {
                    method: method.name,
                },
            }
        }
        return
    }
}
