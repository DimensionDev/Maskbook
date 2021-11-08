import {
    ChainId,
    getChainConstants,
    getRedPacketConstants,
    isSameAddress,
    getChainName,
} from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import { Interface } from '@ethersproject/abi'
import type { RedPacketJSONPayloadFromChain } from '../../types'
import type BigNumber from 'bignumber.js'
import { getTransactionReceipt } from '../../../../extension/background-script/EthereumService'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import { checkAvailability } from './checkAvailability'

const interFace = new Interface(REDPACKET_ABI)

export async function getRedPacketHistory(
    chainId: ChainId,
    startBlock: number | undefined,
    endBlock: number,
    senderAddress: string,
) {
    const { EXPLORER_API, EXPLORER_API_KEY } = getChainConstants(chainId)
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = getRedPacketConstants(chainId)
    if (!EXPLORER_API || !HAPPY_RED_PACKET_ADDRESS_V4 || !startBlock) return []

    //#region
    // 1. Filter out `create_red_packet` transactions,
    // 2. Retrieve payload major data from its decoded input param.
    const response = await fetch(
        urlcat(EXPLORER_API, {
            apikey: EXPLORER_API_KEY,
            action: 'txlist',
            module: 'account',
            sort: 'desc',
            startBlock,
            endBlock,
            address: HAPPY_RED_PACKET_ADDRESS_V4,
        }),
    )

    if (!response.ok) return []

    type TxType = {
        hash: string
        input: string
        from: string
        to: string
        blockNumber: string
    }

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

    const { result } = await response.json()

    if (!result.length) return []

    const payloadList: RedPacketJSONPayloadFromChain[] = result.reduce(
        (acc: RedPacketJSONPayloadFromChain[], cur: TxType) => {
            if (!isSameAddress(cur.from, senderAddress)) return acc
            try {
                const decodedInputParam = interFace.decodeFunctionData(
                    'create_red_packet',
                    cur.input,
                ) as unknown as CreateRedpacketParam

                const redpacketPayload: RedPacketJSONPayloadFromChain = {
                    contract_address: cur.to,
                    txid: cur.hash,
                    shares: decodedInputParam._number.toNumber(),
                    is_random: decodedInputParam._ifrandom,
                    total: decodedInputParam._total_tokens.toString(),
                    duration: decodedInputParam._duration.toNumber() * 1000,
                    block_number: Number(cur.blockNumber),
                    contract_version: 4,
                    network: getChainName(chainId),
                    token_address: decodedInputParam._token_addr,
                    sender: {
                        address: senderAddress,
                        name: decodedInputParam._name,
                        message: decodedInputParam._message,
                    },
                    //#region Retrieve at step 3
                    rpid: '',
                    creation_time: 0,
                    //#endregion
                    //#region Retrieve at step 4
                    total_remaining: '',
                    claimers: [],
                    //#endregion
                    //#region Retrieve from database
                    password: '',
                    //#endregion
                }
                return acc.concat(redpacketPayload)
            } catch {
                return acc
            }
        },
        [],
    )
    //#endregion

    //#region
    // 3. Decode CreationSuccess event log to retrieve `rpid` and `creation_time` for payload
    type CreationSuccessEventParams = {
        id: string
        creation_time: BigNumber
    }

    const eventLogResponse = await Promise.allSettled(
        payloadList.map(async (payload) => {
            const result = await getTransactionReceipt(payload.txid)

            if (!result) return null

            const log = result.logs.find((log) => isSameAddress(log.address, HAPPY_RED_PACKET_ADDRESS_V4))
            if (!log) return null

            const eventParams = interFace.decodeEventLog(
                'CreationSuccess',
                log.data,
                log.topics,
            ) as unknown as CreationSuccessEventParams

            payload.rpid = eventParams.id
            payload.creation_time = eventParams.creation_time.toNumber() * 1000

            // 4. retrieve `claimers` and `total_remaining`
            const data = await checkAvailability(
                payload.rpid,
                payload.sender.address,
                payload.contract_address,
                chainId,
            )

            payload.claimers = Array.from({ length: data.claimed }).map(() => ({ address: '', name: '' }))
            payload.total_remaining = data.balance

            return payload
        }),
    )
    //#endregion

    return eventLogResponse
        .map((v) => (v.status === 'fulfilled' && v.value ? v.value : null))
        .filter((v) => Boolean(v)) as RedPacketJSONPayloadFromChain[]
}
