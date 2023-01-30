import urlcat from 'urlcat'
import type { BigNumber } from 'bignumber.js'
import { first } from 'lodash-es'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    ChainId,
    chainResolver,
    getExplorerConstants,
    getRedPacketConstants,
    getNftRedPacketConstants,
} from '@masknet/web3-shared-evm'
import { Interface } from '@ethersproject/abi'
import type { RedPacketJSONPayloadFromChain, NftRedPacketJSONPayload, TxType } from '../../types.js'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import NFT_REDPACKET_ABI from '@masknet/web3-contracts/abis/NftRedPacket.json'

// #region redpacket
const redPacketInterFace = new Interface(REDPACKET_ABI)

export async function getRedPacketHistory(
    chainId: ChainId,
    startBlock: number | undefined,
    endBlock: number,
    senderAddress: string,
) {
    const { EXPLORER_API, API_KEYS = [] } = getExplorerConstants(chainId)
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = getRedPacketConstants(chainId)
    if (!EXPLORER_API || !HAPPY_RED_PACKET_ADDRESS_V4 || !startBlock || !senderAddress) return []

    // 1. Filter out `create_red_packet` transactions,
    // 2. Retrieve payload major data from its decoded input param.
    const response = await fetch(
        urlcat(EXPLORER_API, {
            apikey: first(API_KEYS),
            action: 'txlist',
            module: 'account',
            sort: 'desc',
            startBlock,
            endBlock,
            address: HAPPY_RED_PACKET_ADDRESS_V4,
        }),
    )

    if (!response.ok) return []

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

    const {
        result,
    }: {
        result: TxType[]
    } = await response.json()
    if (!result.length) return []

    const payloadList: RedPacketJSONPayloadFromChain[] = result.flatMap((txType: TxType) => {
        if (!isSameAddress(txType.from, senderAddress)) return []
        try {
            const decodedInputParam = redPacketInterFace.decodeFunctionData(
                'create_red_packet',
                txType.input,
            ) as unknown as CreateRedpacketParam

            const redpacketPayload: RedPacketJSONPayloadFromChain = {
                contract_address: txType.to,
                txid: txType.hash,
                shares: decodedInputParam._number.toNumber(),
                is_random: decodedInputParam._ifrandom,
                total: decodedInputParam._total_tokens.toString(),
                duration: decodedInputParam._duration.toNumber() * 1000,
                block_number: Number(txType.blockNumber),
                contract_version: 4,
                network: chainResolver.networkType(chainId),
                token_address: decodedInputParam._token_addr,
                sender: {
                    address: senderAddress,
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
    return payloadList
}
// #endregion

// #region nft redpacket
const nftRedPacketInterFace = new Interface(NFT_REDPACKET_ABI)

export async function getNFTRedPacketHistory(
    chainId: ChainId,
    startBlock: number | undefined,
    endBlock: number,
    senderAddress: string,
) {
    const { EXPLORER_API, API_KEYS = [] } = getExplorerConstants(chainId)
    const { RED_PACKET_NFT_ADDRESS } = getNftRedPacketConstants(chainId)

    if (!EXPLORER_API || !RED_PACKET_NFT_ADDRESS || !startBlock || !senderAddress) return []

    const response = await fetch(
        urlcat(EXPLORER_API, {
            apikey: first(API_KEYS),
            action: 'txlist',
            module: 'account',
            sort: 'desc',
            startBlock,
            endBlock,
            address: RED_PACKET_NFT_ADDRESS,
        }),
    )

    if (!response.ok) return []

    type CreateRedpacketParam = {
        _public_key: string
        _duration: BigNumber
        _seed: string
        _message: string
        _name: string
        _token_addr: string
        _erc721_token_ids: BigNumber[]
    }

    const {
        result,
    }: {
        result: TxType[]
    } = await response.json()

    if (!result.length) return []

    const payloadList: NftRedPacketJSONPayload[] = result.flatMap((txType: TxType) => {
        if (!isSameAddress(txType.from, senderAddress)) return []
        try {
            const decodedInputParam = nftRedPacketInterFace.decodeFunctionData(
                'create_red_packet',
                txType.input,
            ) as unknown as CreateRedpacketParam

            const redpacketPayload: NftRedPacketJSONPayload = {
                contract_address: txType.to,
                txid: txType.hash,
                contract_version: 1,
                shares: decodedInputParam._erc721_token_ids.length,
                network: chainResolver.networkType(chainId),
                token_address: decodedInputParam._token_addr,
                chainId,
                sender: {
                    address: senderAddress,
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
    return payloadList
}
// #endregion
