import { useAsyncRetry } from 'react-use'
import { useMemo } from 'react'
import { EMPTY_LIST } from '@masknet/shared-base'
import { type ChainId, getRedPacketConstants } from '@masknet/web3-shared-evm'
import { RedPacket, TheGraphRedPacket, Web3 } from '@masknet/web3-providers'
import { useWallet } from '@masknet/web3-hooks-base'
import { Interface } from '@ethersproject/abi'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import { RedPacketRPC } from '../../messages.js'

const redPacketInterFace = new Interface(REDPACKET_ABI)

const CREATE_RED_PACKET_METHOD_ID = '0x5db05aba'

export function useRedPacketHistory(address: string, chainId: ChainId) {
    const wallet = useWallet()
    const { HAPPY_RED_PACKET_ADDRESS_V4_BLOCK_HEIGHT, HAPPY_RED_PACKET_ADDRESS_V4 } = getRedPacketConstants(chainId)
    const result = useAsyncRetry(async () => {
        if (!HAPPY_RED_PACKET_ADDRESS_V4) return EMPTY_LIST

        if (wallet?.owner) {
            const historyTransactions = await TheGraphRedPacket.getHistories(
                chainId,
                address,
                HAPPY_RED_PACKET_ADDRESS_V4,
            )

            if (!historyTransactions) return EMPTY_LIST
            return RedPacketRPC.getRedPacketHistoryFromDatabase(historyTransactions)
        }

        const blockNumber = await Web3.getBlockNumber({ chainId })
        const payloadList = await RedPacket.getHistories(
            chainId,
            address,
            HAPPY_RED_PACKET_ADDRESS_V4,
            CREATE_RED_PACKET_METHOD_ID,
            HAPPY_RED_PACKET_ADDRESS_V4_BLOCK_HEIGHT ?? 0,
            blockNumber,
        )
        if (!payloadList) return EMPTY_LIST

        return RedPacketRPC.getRedPacketHistoryFromDatabase(payloadList)
    }, [address, chainId, wallet?.owner])

    const value = useMemo(
        () => result.value?.filter((x) => x.chainId === chainId).sort((a, b) => b.creation_time - a.creation_time),
        [chainId, result.value],
    )

    return { ...result, value }
}
