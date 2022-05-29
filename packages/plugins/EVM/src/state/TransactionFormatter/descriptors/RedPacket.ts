import { i18NextInstance } from '@masknet/shared-base'
import { ChainId, getNftRedPacketConstants, getRedPacketConstants } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types'
import { Web3StateSettings } from '../../../settings'
import { isSameAddress, formatBalance, TransactionContext } from '@masknet/web3-shared-base'

export class RedPacketDescriptor implements TransactionDescriptor {
    // TODO: 6002: avoid using i18n text in a service. delegate it to ui.
    async compute(context: TransactionContext<ChainId>) {
        if (!context.name) return
        if (context.name !== 'create_red_packet') return

        const { HAPPY_RED_PACKET_ADDRESS_V4 } = getRedPacketConstants(context.chainId)
        const { RED_PACKET_NFT_ADDRESS } = getNftRedPacketConstants(context.chainId)

        if (isSameAddress(context.to, HAPPY_RED_PACKET_ADDRESS_V4)) {
            const connection = await Web3StateSettings.value.Connection?.getConnection?.({
                chainId: context.chainId,
                account: context.from,
            })

            const token = await connection?.getFungibleToken(context.parameters?._token_addr ?? '')
            const amount = formatBalance(context.parameters?._total_tokens)

            return {
                chainId: context.chainId,
                title: 'Create Red Packet',
                description: i18NextInstance.t('plugin_red_packet_create_with_token', {
                    amount,
                    symbol: token?.symbol,
                }),
            }
        } else if (isSameAddress(context.to, RED_PACKET_NFT_ADDRESS)) {
            return {
                chainId: context.chainId,
                title: 'Create NFT Red Packet',
                description: i18NextInstance.t('plugin_nft_red_packet_create'),
            }
        }
        return
    }
}
