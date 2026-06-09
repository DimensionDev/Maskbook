import {
    type ChainId,
    getRedPacketConstants,
    type AbiFunctionToObjectMapped,
    type TransactionParameter,
} from '@masknet/web3-shared-evm'
import { isSameAddress, type TransactionContext } from '@masknet/web3-shared-base'
import type { TransactionDescriptorFormatResult } from '../types.js'
import { DescriptorWithTransactionDecodedReceipt, getTokenAmountDescription } from '../utils.js'
import { HappyRedPacketV4Abi } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'

export class RedPacketDescriptor extends DescriptorWithTransactionDecodedReceipt {
    async getClaimTokenInfo(chainId: ChainId, contractAddress: string | undefined, hash: string | undefined) {
        const events = await this.getReceipt(chainId, contractAddress, HappyRedPacketV4Abi, hash)

        const { claimed_value, token_address } = events?.ClaimSuccess?.returnValues ?? {}
        if (!token_address) return

        const token = await this.Hub.getFungibleToken(token_address ?? '', { chainId })
        if (!token) return

        return getTokenAmountDescription(claimed_value, token)
    }

    async getRefundTokenInfo(chainId: ChainId, contractAddress: string | undefined, hash: string | undefined) {
        const events = await this.getReceipt(chainId, contractAddress, HappyRedPacketV4Abi, hash)

        const { remaining_balance, token_address } = events?.RefundSuccess?.returnValues ?? {}

        if (!token_address) return

        const token = await this.Hub.getFungibleToken(token_address ?? '', { chainId })
        if (!token) return

        return getTokenAmountDescription(remaining_balance, token)
    }

    // TODO: 6002: avoid using i18n text in a service. delegate it to ui.
    override async compute(
        context_: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorFormatResult | undefined> {
        const context = context_ as TransactionContext<ChainId>

        const {
            HAPPY_RED_PACKET_ADDRESS_V1,
            HAPPY_RED_PACKET_ADDRESS_V2,
            HAPPY_RED_PACKET_ADDRESS_V3,
            HAPPY_RED_PACKET_ADDRESS_V4,
        } = getRedPacketConstants(context.chainId)
        const method = context.methods?.find((x) => ['create_red_packet', 'claim', 'refund'].includes(x.name ?? ''))

        if (
            [
                HAPPY_RED_PACKET_ADDRESS_V1,
                HAPPY_RED_PACKET_ADDRESS_V2,
                HAPPY_RED_PACKET_ADDRESS_V3,
                HAPPY_RED_PACKET_ADDRESS_V4,
            ].some((x) => isSameAddress(x, context.to))
        ) {
            if (
                method?.name === 'create_red_packet' &&
                method?.parameters?._token_addr &&
                method?.parameters?._total_tokens
            ) {
                const parameters = method.parameters as AbiFunctionToObjectMapped<
                    HappyRedPacketV4Abi,
                    'create_red_packet',
                    'inputs'
                >
                const token = await this.Hub.getFungibleToken(parameters?._token_addr ?? '', {
                    chainId: context.chainId,
                })
                const tokenAmountDescription = getTokenAmountDescription(parameters?._total_tokens, token)
                return {
                    chainId: context.chainId,
                    tokenInAddress: token?.address,
                    tokenInAmount: String(parameters?._total_tokens),
                    title: 'Create Lucky Drop',
                    description: 'Create your Lucky Drop.',
                    snackbar: {
                        successfulDescription: {
                            key: 'Lucky drop with {token} created.',
                            token: tokenAmountDescription,
                        },
                        failedDescription: 'Failed to create Lucky Drop.',
                    },
                    popup: {
                        method: method.name,
                    },
                }
            } else if (method?.name === 'claim') {
                const tokenAmountDescription = await this.getClaimTokenInfo(context.chainId, context.to, context.hash)

                return {
                    chainId: context.chainId,
                    title: 'Claim Lucky Drop',
                    description: 'Claim your Lucky Drop.',
                    snackbar: {
                        successfulDescription:
                            tokenAmountDescription ?
                                { key: 'Lucky Drop with {token} claimed.', token: tokenAmountDescription }
                            :   'Lucky Drop claimed.',
                        failedDescription: 'Failed to claim Lucky Drop.',
                    },
                    popup: {
                        method: method.name,
                    },
                }
            } else {
                const tokenAmountDescription = await this.getRefundTokenInfo(context.chainId, context.to, context.hash)
                return {
                    chainId: context.chainId,
                    title: 'Refund Lucky drop',
                    description: 'Refund your expired Lucky Drop.',
                    snackbar: {
                        successfulDescription:
                            tokenAmountDescription ?
                                { key: 'Lucky Drop with {token} refunded.', token: tokenAmountDescription }
                            :   'Lucky Drop refunded.',
                        failedDescription: 'Failed to refund Lucky Drop.',
                    },
                    popup: {
                        method: method?.name,
                    },
                }
            }
        }
        return
    }
}
