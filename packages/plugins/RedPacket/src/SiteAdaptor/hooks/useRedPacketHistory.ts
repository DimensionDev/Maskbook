import { EMPTY_LIST } from '@masknet/shared-base'
import { useWallet } from '@masknet/web3-hooks-base'
import { RedPacket, TheGraphRedPacket, EVMWeb3 } from '@masknet/web3-providers'
import type { RedPacketJSONPayloadFromChain } from '@masknet/web3-providers/types'
import { getRedPacketConstants, type ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { RedPacketRPC } from '../../messages.js'

const CREATE_RED_PACKET_METHOD_ID = '0x5db05aba'

export function useRedPacketHistory(address: string, chainId: ChainId) {
    const wallet = useWallet()
    const { HAPPY_RED_PACKET_ADDRESS_V4_BLOCK_HEIGHT, HAPPY_RED_PACKET_ADDRESS_V4 } = getRedPacketConstants(chainId)
    const query = useQuery({
        queryKey: ['red-packet-history', chainId, address, wallet?.owner],
        queryFn: async () => {
            if (!HAPPY_RED_PACKET_ADDRESS_V4) return EMPTY_LIST as RedPacketJSONPayloadFromChain[]

            if (wallet?.owner) {
                const historyTransactions = await TheGraphRedPacket.getHistories(
                    chainId,
                    address,
                    HAPPY_RED_PACKET_ADDRESS_V4,
                )

                if (!historyTransactions) return EMPTY_LIST as RedPacketJSONPayloadFromChain[]
                return RedPacketRPC.getRedPacketHistoryFromDatabase(historyTransactions)
            }

            const blockNumber = await EVMWeb3.getBlockNumber({ chainId })
            const payloadList = await RedPacket.getHistories(
                chainId,
                address,
                HAPPY_RED_PACKET_ADDRESS_V4,
                CREATE_RED_PACKET_METHOD_ID,
                HAPPY_RED_PACKET_ADDRESS_V4_BLOCK_HEIGHT ?? 0,
                blockNumber,
            )
            if (!payloadList) return EMPTY_LIST as RedPacketJSONPayloadFromChain[]

            return RedPacketRPC.getRedPacketHistoryFromDatabase(payloadList)
        },
    })

    const data = useMemo(
        () => query.data?.filter((x) => x.chainId === chainId).sort((a, b) => b.creation_time - a.creation_time),
        [chainId, query.data],
    )

    return [data, query] as const
}
