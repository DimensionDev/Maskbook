import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import { type ChainId, getNftRedPacketConstants } from '@masknet/web3-shared-evm'
import { useWallet } from '@masknet/web3-hooks-base'
import { RedPacket, TheGraphRedPacket, Web3 } from '@masknet/web3-providers'
import { RedPacketRPC } from '../../messages.js'
import type { NftRedPacketJSONPayload } from '@masknet/web3-providers/types'

const CREATE_RED_PACKET_METHOD_ID = '0x29e744bf'

export function useNftRedPacketHistory(address: string, chainId: ChainId) {
    const wallet = useWallet()
    const { NFT_RED_PACKET_ADDRESS_BLOCK_HEIGHT, RED_PACKET_NFT_ADDRESS } = getNftRedPacketConstants(chainId)

    return useAsyncRetry(async () => {
        if (!RED_PACKET_NFT_ADDRESS) return EMPTY_LIST as NftRedPacketJSONPayload[]
        if (wallet?.owner) {
            const historyTransactions = await TheGraphRedPacket.getNFTHistories(
                chainId,
                address,
                RED_PACKET_NFT_ADDRESS,
            )
            if (!historyTransactions) return EMPTY_LIST as NftRedPacketJSONPayload[]

            return RedPacketRPC.getNftRedPacketHistory(historyTransactions)
        }
        const blockNumber = await Web3.getBlockNumber({ chainId })
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
    }, [address, chainId, wallet?.owner])
}
