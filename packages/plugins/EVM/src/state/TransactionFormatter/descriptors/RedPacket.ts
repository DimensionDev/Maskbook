import { i18NextInstance } from '@masknet/shared-base'
import {
    ChainId,
    getNftRedPacketConstants,
    getRedPacketConstants,
    isNativeTokenAddress,
    TransactionParameter,
} from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types'
import { Web3StateSettings } from '../../../settings'
import { isSameAddress, formatBalance, TransactionContext } from '@masknet/web3-shared-base'

export class RedPacketDescriptor implements TransactionDescriptor {
    // TODO: 6002: avoid using i18n text in a service. delegate it to ui.
    async compute(context_: TransactionContext<ChainId, TransactionParameter>) {
        const context = context_ as TransactionContext<ChainId, string | undefined>
        const { HAPPY_RED_PACKET_ADDRESS_V4 } = getRedPacketConstants(context.chainId)
        const { RED_PACKET_NFT_ADDRESS } = getNftRedPacketConstants(context.chainId)

        const method = context.methods?.find((x) => ['create_red_packet', 'claim'].includes(x.name ?? ''))

        if (
            isSameAddress(context.to, HAPPY_RED_PACKET_ADDRESS_V4) &&
            method?.parameters?._token_addr &&
            method?.parameters?._total_tokens
        ) {
            const connection = await Web3StateSettings.value.Connection?.getConnection?.({
                chainId: context.chainId,
                account: context.from,
            })
            const token = await connection?.getFungibleToken(method?.parameters?._token_addr ?? '')
            const amount = formatBalance(
                method.parameters?._total_tokens,
                token?.decimals,
                isNativeTokenAddress(method.parameters?._token_addr) ? 6 : 0,
            )
            if (method?.name === 'create_red_packet') {
                return {
                    chainId: context.chainId,
                    title: 'Create Lucky Drop',
                    description: i18NextInstance.t('plugin_red_packet_create_with_token', {
                        amount,
                        symbol: token?.symbol,
                    }),
                }
            } else if (method?.name === 'claim') {
                return {
                    chainId: context.chainId,
                    title: 'Claim Lucky Drop',
                    description: i18NextInstance.t('plugin_red_packet_claim_notification'),
                }
            }
        } else if (isSameAddress(context.to, RED_PACKET_NFT_ADDRESS)) {
            if (method?.name === 'create_red_packet') {
                return {
                    chainId: context.chainId,
                    title: 'Create NFT Lucky Drop',
                    description: i18NextInstance.t('plugin_nft_red_packet_create'),
                }
            } else if (method?.name === 'claim') {
                return {
                    chainId: context.chainId,
                    title: 'Claim NFT Lucky Drop',
                    description: i18NextInstance.t('plugin_nft_red_packet_claim'),
                }
            }
        }
        return
    }
}
