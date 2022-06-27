import urlcat from 'urlcat'
import type BigNumber from 'bignumber.js'
import { first } from 'lodash-unified'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, chainResolver, getExplorerConstants, getRedPacketConstants } from '@masknet/web3-shared-evm'
import { Interface } from '@ethersproject/abi'
import type { RedPacketJSONPayloadFromChain } from '../../types'
import REDPACKET_ABI from '@masknet/web3-contracts/abis/HappyRedPacketV4.json'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'

const interFace = new Interface(REDPACKET_ABI)

export async function getRedPacketHistory(
    chainId: ChainId,
    startBlock: number | undefined,
    endBlock: number,
    senderAddress: string,
    connection: Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_EVM>,
) {
    const { EXPLORER_API, API_KEYS = [] } = getExplorerConstants(chainId)
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = getRedPacketConstants(chainId)
    if (!EXPLORER_API || !HAPPY_RED_PACKET_ADDRESS_V4 || !startBlock) return []

    // #region
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

    const { result }: { result: TxType[] } = await response.json()
    if (!result.length) return []

    const payloadList: RedPacketJSONPayloadFromChain[] = result.flatMap((txType: TxType) => {
        if (!isSameAddress(txType.from, senderAddress)) return []
        try {
            const decodedInputParam = interFace.decodeFunctionData(
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
                network: chainResolver.chainNetworkType(chainId),
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
                claimers: [],
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
    // #endregion
    return payloadList
}
