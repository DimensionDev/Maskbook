import { i18NextInstance } from '@masknet/shared-base'
import { ChainId, getNftRedPacketConstant, getRedPacketConstant, TransactionParameter } from '@masknet/web3-shared-evm'
import HappyRedPacketV4ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import NftRedPacketABI from '@masknet/web3-contracts/abis/NftRedPacket.json'
import { isSameAddress, TransactionContext } from '@masknet/web3-shared-base'
import type { TransactionDescriptor } from '../types'
import { Web3StateSettings } from '../../../settings'
import type { AbiItem } from 'web3-utils'
import { DescriptorWithTransactionReceipt, getTokenAmountDescription } from '../utils'

export class RedPacketDescriptor extends DescriptorWithTransactionReceipt implements TransactionDescriptor {
    async getClaimTokenInfo(chainId: ChainId, contractAddress: string | undefined, hash: string | undefined) {
        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId,
        })
        const events = await this.getReceipt(chainId, contractAddress, HappyRedPacketV4ABI as AbiItem[], hash)

        const { claimed_value, token_address } = (events?.ClaimSuccess.returnValues ?? {}) as {
            claimed_value: string
            token_address: string
        }

        if (!token_address) return

        const token = await connection?.getFungibleToken(token_address ?? '')

        if (!token) return

        return getTokenAmountDescription(claimed_value, token)
    }

    async getRefundTokenInfo(chainId: ChainId, contractAddress: string | undefined, hash: string | undefined) {
        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId,
        })
        const events = await this.getReceipt(chainId, contractAddress, HappyRedPacketV4ABI as AbiItem[], hash)

        const { remaining_balance, token_address } = (events?.RefundSuccess.returnValues ?? {}) as {
            token_address: string
            remaining_balance: string
        }

        if (!token_address) return

        const token = await connection?.getFungibleToken(token_address ?? '')

        if (!token) return

        return getTokenAmountDescription(remaining_balance, token)
    }

    async getClaimedNFTSymbol(chainId: ChainId, contractAddress: string | undefined, hash: string | undefined) {
        const events = await this.getReceipt(chainId, contractAddress, NftRedPacketABI as AbiItem[], hash)

        const { token_address } = (events?.ClaimSuccess.returnValues ?? {}) as {
            token_address: string
        }

        if (!token_address) return

        return this.getNonFungibleContractSymbol(chainId, token_address)
    }

    async getNonFungibleContractSymbol(chainId: ChainId, address: string) {
        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId,
        })
        const contract = await connection?.getNonFungibleTokenContract(address)
        return contract?.symbol && contract?.symbol.length > 15
            ? `${contract?.symbol.slice(0, 12)}...`
            : contract?.symbol
    }

    // TODO: 6002: avoid using i18n text in a service. delegate it to ui.
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId, string | undefined>
        const HAPPY_RED_PACKET_ADDRESS_V4 = getRedPacketConstant(context.chainId, 'HAPPY_RED_PACKET_ADDRESS_V4')
        const RED_PACKET_NFT_ADDRESS = getNftRedPacketConstant(context.chainId, 'RED_PACKET_NFT_ADDRESS')
        const method = context.methods?.find((x) => ['create_red_packet', 'claim'].includes(x.name ?? ''))

        if (isSameAddress(context.to, HAPPY_RED_PACKET_ADDRESS_V4)) {
            const connection = await Web3StateSettings.value.Connection?.getConnection?.({
                chainId: context.chainId,
                account: context.from,
            })

            if (
                method?.name === 'create_red_packet' &&
                method?.parameters?._token_addr &&
                method?.parameters?._total_tokens
            ) {
                const token = await connection?.getFungibleToken(method?.parameters?._token_addr ?? '')
                const tokenAmountDescription = getTokenAmountDescription(method.parameters?._total_tokens, token)
                return {
                    chainId: context.chainId,
                    title: i18NextInstance.t('plugin_red_packet_create_with_token_title'),
                    description: i18NextInstance.t('plugin_red_packet_create_with_token'),
                    successfulDescription: i18NextInstance.t('plugin_red_packet_create_with_token_success', {
                        tokenAmountDescription,
                    }),
                    failedDescription: i18NextInstance.t('plugin_red_packet_create_with_token_fail'),
                }
            } else if (method?.name === 'claim') {
                const tokenAmountDescription = await this.getClaimTokenInfo(
                    context.chainId,
                    HAPPY_RED_PACKET_ADDRESS_V4,
                    context.hash,
                )

                return {
                    chainId: context.chainId,
                    title: i18NextInstance.t('plugin_red_packet_claim_title'),
                    description: i18NextInstance.t('plugin_red_packet_claim_notification'),
                    successfulDescription: tokenAmountDescription
                        ? i18NextInstance.t('plugin_red_packet_claim_success', {
                              tokenAmountDescription,
                          })
                        : i18NextInstance.t('plugin_red_packet_claim_success_without_details'),
                    failedDescription: i18NextInstance.t('plugin_red_packet_claim_fail'),
                }
            } else if (method?.name === 'refund') {
                const tokenAmountDescription = await this.getRefundTokenInfo(
                    context.chainId,
                    HAPPY_RED_PACKET_ADDRESS_V4,
                    context.hash,
                )

                return {
                    chainId: context.chainId,
                    title: i18NextInstance.t('plugin_red_packet_refund_with_token_title'),
                    description: i18NextInstance.t('plugin_red_packet_refund_with_token'),
                    successfulDescription: tokenAmountDescription
                        ? i18NextInstance.t('plugin_red_packet_refund_with_token_success', {
                              tokenAmountDescription,
                          })
                        : i18NextInstance.t('plugin_red_packet_refund_with_token_success_without_detail'),
                    failedDescription: i18NextInstance.t('plugin_red_packet_refund_with_token_fail'),
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
                    title: i18NextInstance.t('plugin_nft_red_packet_create_title'),
                    description: i18NextInstance.t('plugin_nft_red_packet_create'),
                    successfulDescription: symbol
                        ? i18NextInstance.t('plugin_nft_red_packet_create_success', {
                              symbol,
                          })
                        : i18NextInstance.t('plugin_nft_red_packet_create_success_without_detail'),
                    failedDescription: i18NextInstance.t('plugin_red_packet_create_with_token_fail'),
                }
            } else if (method?.name === 'claim') {
                const symbol = await this.getClaimedNFTSymbol(context.chainId, RED_PACKET_NFT_ADDRESS, context.hash)
                return {
                    chainId: context.chainId,
                    title: i18NextInstance.t('plugin_nft_red_packet_claim_title'),
                    description: i18NextInstance.t('plugin_nft_red_packet_claim'),
                    successfulDescription: symbol
                        ? i18NextInstance.t('plugin_nft_red_packet_claim_success', {
                              symbol,
                          })
                        : i18NextInstance.t('plugin_nft_red_packet_claim_success_without_detail'),
                    failedDescription: i18NextInstance.t('plugin_red_packet_claim_fail'),
                }
            }
        }
        return
    }
}
