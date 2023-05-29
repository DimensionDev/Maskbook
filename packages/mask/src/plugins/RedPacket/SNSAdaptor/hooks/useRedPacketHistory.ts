import { useAsyncRetry } from 'react-use'
import { useMemo } from 'react'
import type { BigNumber } from 'bignumber.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import { type ChainId, getRedPacketConstants, chainResolver } from '@masknet/web3-shared-evm'
import { RedPacket, TheGraphRedPacket, Web3 } from '@masknet/web3-providers'
import { useWallet } from '@masknet/web3-hooks-base'
import { Interface } from '@ethersproject/abi'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import type { RedPacketJSONPayloadFromChain } from '../../types.js'
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
        const historyTransactions = await RedPacket.getHistories(
            chainId,
            address,
            HAPPY_RED_PACKET_ADDRESS_V4,
            CREATE_RED_PACKET_METHOD_ID,
            HAPPY_RED_PACKET_ADDRESS_V4_BLOCK_HEIGHT,
            blockNumber,
        )
        if (!historyTransactions) return EMPTY_LIST

        type CreateRedpacketParam = {
            _duration: BigNumber
            _ifrandom: boolean
            _message: string
            _name: string
            _number: BigNumber
            _public_key: string
            _seed: string
            _token_addr: string
            _token_type: BigNumber
            _total_tokens: BigNumber
        }

        const payloadList: RedPacketJSONPayloadFromChain[] = historyTransactions.flatMap((tx) => {
            try {
                const decodedInputParam = redPacketInterFace.decodeFunctionData(
                    'create_red_packet',
                    tx.input ?? '',
                ) as unknown as CreateRedpacketParam

                const redpacketPayload: RedPacketJSONPayloadFromChain = {
                    contract_address: tx.to,
                    txid: tx.hash ?? '',
                    chainId,
                    shares: decodedInputParam._number.toNumber(),
                    is_random: decodedInputParam._ifrandom,
                    total: decodedInputParam._total_tokens.toString(),
                    duration: decodedInputParam._duration.toNumber() * 1000,
                    block_number: Number(tx.blockNumber),
                    contract_version: 4,
                    network: chainResolver.networkType(chainId),
                    token_address: decodedInputParam._token_addr,
                    sender: {
                        address,
                        name: decodedInputParam._name,
                        message: decodedInputParam._message,
                    },
                    // #region Retrieve at RedPacketInHistoryList component
                    rpid: '',
                    creation_time: 0,
                    total_remaining: '',
                    // #endregion
                    // #region Retrieve from database
                    password: '',
                    // #endregion
                }
                return redpacketPayload
            } catch {
                return []
            }
        })
        return RedPacketRPC.getRedPacketHistoryFromDatabase(payloadList)
    }, [address, chainId, wallet?.owner])

    const value = useMemo(
        () => result.value?.filter((x) => x.chainId === chainId).sort((a, b) => b.creation_time - a.creation_time),
        [chainId, result.value],
    )

    return { ...result, value }
}
