import { EMPTY_LIST } from '@masknet/shared-base'
import { useWallet } from '@masknet/web3-hooks-base'
import { EVMWeb3, RedPacket, TheGraphRedPacket } from '@masknet/web3-providers'
import type { NftRedPacketJSONPayload } from '@masknet/web3-providers/types'
import { getNftRedPacketConstants, type ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { RedPacketRPC } from '../../messages.js'

const CREATE_RED_PACKET_METHOD_ID = '0x29e744bf'

export function useNftRedPacketHistory(address: string, chainId: ChainId) {
    const wallet = useWallet()
    const { NFT_RED_PACKET_ADDRESS_BLOCK_HEIGHT, RED_PACKET_NFT_ADDRESS } = getNftRedPacketConstants(chainId)
    const isOwner = !!wallet?.owner
    return useQuery({
        queryKey: [
            'nft-redpacket-histories',
            chainId,
            RED_PACKET_NFT_ADDRESS,
            address,
            isOwner,
            NFT_RED_PACKET_ADDRESS_BLOCK_HEIGHT,
        ],
        queryFn: async () => {
            if (!RED_PACKET_NFT_ADDRESS) return EMPTY_LIST as NftRedPacketJSONPayload[]
            if (isOwner) {
                const historyTransactions = await TheGraphRedPacket.getNFTHistories(
                    chainId,
                    address,
                    RED_PACKET_NFT_ADDRESS,
                )
                if (!historyTransactions) return EMPTY_LIST as NftRedPacketJSONPayload[]

                return RedPacketRPC.getNftRedPacketHistory(historyTransactions)
            }
            const blockNumber = await EVMWeb3.getBlockNumber({ chainId })
            const payloadList = await RedPacket.getNFTHistories(
                chainId,
                address,
                RED_PACKET_NFT_ADDRESS,
                CREATE_RED_PACKET_METHOD_ID,
                NFT_RED_PACKET_ADDRESS_BLOCK_HEIGHT ?? 0,
                blockNumber,
            )
            if (!payloadList) return EMPTY_LIST as NftRedPacketJSONPayload[]

            return RedPacketRPC.getNftRedPacketHistory(payloadList)
        },
    })
}
