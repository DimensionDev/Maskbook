import type { AbiItem } from 'web3-utils'
import {
    type ChainId,
    getNftRedPacketConstant,
    getRedPacketConstants,
    type TransactionParameter,
} from '@masknet/web3-shared-evm'
import HappyRedPacketV4ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import NftRedPacketABI from '@masknet/web3-contracts/abis/NftRedPacket.json'
import { isSameAddress, type TransactionContext } from '@masknet/web3-shared-base'
import type { TransactionDescriptorFormatResult } from '../types.js'
import { DescriptorWithTransactionDecodedReceipt, getTokenAmountDescription } from '../utils.js'

export class RedPacketDescriptor extends DescriptorWithTransactionDecodedReceipt {
    async getClaimTokenInfo(chainId: ChainId, contractAddress: string | undefined, hash: string | undefined) {
        const events = await this.getReceipt(chainId, contractAddress, HappyRedPacketV4ABI as AbiItem[], hash)

        const { claimed_value, token_address } = (events?.ClaimSuccess?.returnValues ?? {}) as {
            claimed_value: string
            token_address: string
        }
        if (!token_address) return

        const token = await this.Hub.getFungibleToken(token_address ?? '', { chainId })
        if (!token) return

        return getTokenAmountDescription(claimed_value, token)
    }

    async getRefundTokenInfo(chainId: ChainId, contractAddress: string | undefined, hash: string | undefined) {
        const events = await this.getReceipt(chainId, contractAddress, HappyRedPacketV4ABI as AbiItem[], hash)

        const { remaining_balance, token_address } = (events?.RefundSuccess?.returnValues ?? {}) as {
            token_address: string
            remaining_balance: string
        }

        if (!token_address) return

        const token = await this.Hub.getFungibleToken(token_address ?? '', { chainId })
        if (!token) return

        return getTokenAmountDescription(remaining_balance, token)
    }

    async getClaimedNFTSymbol(chainId: ChainId, contractAddress: string | undefined, hash: string | undefined) {
        const events = await this.getReceipt(chainId, contractAddress, NftRedPacketABI as AbiItem[], hash)

        const { token_address } = (events?.ClaimSuccess?.returnValues ?? {}) as {
            token_address: string
        }
        if (!token_address) return

        return this.getNonFungibleContractSymbol(chainId, token_address)
    }

    async getNonFungibleContractSymbol(chainId: ChainId, address: string) {
        const contract = await this.Web3.getNonFungibleTokenContract(address, undefined, { chainId })
        return contract?.symbol && contract?.symbol.length > 15 ?
                `${contract?.symbol.slice(0, 12)}...`
            :   contract?.symbol
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
        const RED_PACKET_NFT_ADDRESS = getNftRedPacketConstant(context.chainId, 'RED_PACKET_NFT_ADDRESS')
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
                const token = await this.Hub.getFungibleToken(method?.parameters?._token_addr ?? '', {
                    chainId: context.chainId,
                })
                const tokenAmountDescription = getTokenAmountDescription(method.parameters?._total_tokens, token)
                return {
                    chainId: context.chainId,
                    tokenInAddress: token?.address,
                    tokenInAmount: method?.parameters?._total_tokens,
                    title: 'Create Lucky Drop',
                    description: 'Create your Lucky Drop.',
                    snackbar: {
                        successfulDescription: {
                            key: 'Create Lucky drop with {token} successfully.',
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
                                { key: 'Claim Lucky Drop with {token} successfully.', token: tokenAmountDescription }
                            :   'Claim Lucky Drop successfully.',
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
                                { key: 'Refund Lucky Drop with {token} successfully.', token: tokenAmountDescription }
                            :   'Refund Lucky Drop successfully.',
                        failedDescription: 'Failed to refund Lucky Drop.',
                    },
                    popup: {
                        method: method?.name,
                    },
                }
            }
        } else if (isSameAddress(context.to, RED_PACKET_NFT_ADDRESS)) {
            if (method?.name === 'create_red_packet') {
                const symbol = await this.getNonFungibleContractSymbol(
                    context.chainId,
                    method.parameters?._token_addr ?? '',
                )
                return {
                    chainId: context.chainId,
                    title: 'Create NFT Lucky Drop',
                    description: 'Create your NFT Lucky Drop.',
                    snackbar: {
                        successfulDescription:
                            symbol ?
                                { key: 'Create {symbol} NFT Lucky Drop successfully.', symbol }
                            :   'Create NFT Lucky Drop successfully.',
                        failedDescription: 'Failed to create Lucky Drop.',
                    },
                    popup: {
                        method: method.name,
                    },
                }
            } else if (method?.name === 'claim') {
                const symbol = await this.getClaimedNFTSymbol(context.chainId, RED_PACKET_NFT_ADDRESS, context.hash)
                return {
                    chainId: context.chainId,
                    title: 'Claim NFT Lucky Drop',
                    description: 'Claim your NFT Lucky Drop',
                    snackbar: {
                        successfulDescription:
                            symbol ?
                                { key: 'Claim 1 {symbol} NFT Lucky Drop successfully.', symbol }
                            :   'Claim NFT Lucky Drop successfully.',
                        failedDescription: 'Failed to claim Lucky Drop.',
                    },
                    popup: {
                        method: method.name,
                    },
                }
            }
        }
        return
    }
}
