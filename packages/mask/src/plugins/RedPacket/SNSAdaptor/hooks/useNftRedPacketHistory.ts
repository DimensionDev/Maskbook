import { useAsyncRetry } from 'react-use'
import type { BigNumber } from 'bignumber.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import {
    type ChainId,
    getNftRedPacketConstants,
    chainResolver,
    type NftRedPacketJSONPayload,
} from '@masknet/web3-shared-evm'
import { useWallet } from '@masknet/web3-hooks-base'
import { RedPacket, TheGraphRedPacket, Web3 } from '@masknet/web3-providers'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/NftRedPacket.json'
import { Interface } from '@ethersproject/abi'

import { RedPacketRPC } from '../../messages.js'

const redPacketInterFace = new Interface(REDPACKET_ABI)

const CREATE_RED_PACKET_METHOD_ID = '0x29e744bf'

export function useNftRedPacketHistory(address: string, chainId: ChainId) {
    const wallet = useWallet()
    const { NFT_RED_PACKET_ADDRESS_BLOCK_HEIGHT, RED_PACKET_NFT_ADDRESS } = getNftRedPacketConstants(chainId)

    return useAsyncRetry(async () => {
        if (!RED_PACKET_NFT_ADDRESS) return EMPTY_LIST
        if (wallet?.owner) {
            const historyTransactions = await TheGraphRedPacket.getNFTHistories(
                chainId,
                address,
                RED_PACKET_NFT_ADDRESS,
            )
            if (!historyTransactions) return EMPTY_LIST

            return RedPacketRPC.getNftRedPacketHistory(historyTransactions)
        }
        const blockNumber = await Web3.getBlockNumber({ chainId })
        const historyTransactions = await RedPacket.getHistories(
            chainId,
            address,
            RED_PACKET_NFT_ADDRESS,
            CREATE_RED_PACKET_METHOD_ID,
            NFT_RED_PACKET_ADDRESS_BLOCK_HEIGHT ?? 0,
            blockNumber,
        )
        if (!historyTransactions) return EMPTY_LIST

        type CreateRedpacketParam = {
            _public_key: string
            _duration: BigNumber
            _seed: string
            _message: string
            _name: string
            _token_addr: string
            _erc721_token_ids: BigNumber[]
        }

        const payloadList: NftRedPacketJSONPayload[] = historyTransactions.flatMap((tx) => {
            try {
                const decodedInputParam = redPacketInterFace.decodeFunctionData(
                    'create_red_packet',
                    tx.input ?? '',
                ) as unknown as CreateRedpacketParam

                const redpacketPayload: NftRedPacketJSONPayload = {
                    contract_address: tx.to,
                    txid: tx.hash ?? '',
                    contract_version: 1,
                    shares: decodedInputParam._erc721_token_ids.length,
                    network: chainResolver.networkType(chainId),
                    token_address: decodedInputParam._token_addr,
                    chainId,
                    sender: {
                        address,
                        name: decodedInputParam._name,
                        message: decodedInputParam._message,
                    },
                    duration: decodedInputParam._duration.toNumber() * 1000,
                    token_ids: decodedInputParam._erc721_token_ids.map((x) => x.toString()),
                    // #region Retrieve at NFT History List Item.
                    rpid: '',
                    creation_time: 0,
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
        return RedPacketRPC.getNftRedPacketHistory(payloadList)
    }, [address, chainId, wallet?.owner])
}
