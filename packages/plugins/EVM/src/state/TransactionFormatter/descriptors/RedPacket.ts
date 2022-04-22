import { i18NextInstance } from '@masknet/shared-base'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import {
    ChainId,
    formatBalance,
    getNftRedPacketConstants,
    getRedPacketConstants,
    isSameAddress,
} from '@masknet/web3-shared-evm'
import { createConnection } from '../../Protocol/connection'
import type { TransactionDescriptor } from '../types'

export class RedPacketDescriptor implements TransactionDescriptor {
    async compute(context: Web3Plugin.TransactionContext<ChainId>) {
        if (!context.name) return
        if (context.name !== 'create_red_packet') return

        const { HAPPY_RED_PACKET_ADDRESS_V4 } = getRedPacketConstants(context.chainId)
        const { RED_PACKET_NFT_ADDRESS } = getNftRedPacketConstants(context.chainId)

        if (isSameAddress(context.to, HAPPY_RED_PACKET_ADDRESS_V4)) {
            const connection = createConnection(context.chainId, context.from)
            const token = await connection.getERC20Token(context.parameters?._token_addr ?? '')
            const amount = formatBalance(context.parameters?._total_tokens)

            return Promise.resolve({
                title: 'Create Red Packet',
                description: i18NextInstance.t('plugin_red_packet_create_with_token', {
                    amount,
                    symbol: token.symbol,
                }),
            })
        } else if (isSameAddress(context.to, RED_PACKET_NFT_ADDRESS)) {
            return Promise.resolve({
                title: 'Create NFT Red Packet',
                description: i18NextInstance.t('plugin_nft_red_packet_create'),
            })
        }
        return
    }
}
