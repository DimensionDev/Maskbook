import {
    ChainId,
    EthereumTokenType,
    getChainDetailed,
    getChainName,
    getRedPacketConstants,
    NativeTokenDetailed,
} from '@masknet/web3-shared'
import { pick } from 'lodash-es'
import { getChainId } from '../../../../extension/background-script/SettingsService'
import { tokenIntoMask } from '../../../ITO/SNSAdaptor/helpers'
import type {
    RedPacketHistory,
    RedPacketJSONPayload,
    RedPacketSubgraphInMask,
    RedPacketSubgraphOutMask,
} from '../../types'

const redPacketBasicKeys = [
    'contract_address',
    'contract_version',
    'rpid',
    'txid',
    'password',
    'shares',
    'is_random',
    'total',
    'creation_time',
    'duration',
]

const TOKEN_FIELDS = `
    type
    address
    name
    symbol
    decimals
    chain_id
`

const USER_FIELDS = `
    address
    name
`

const RED_PACKET_FIELDS = `
    rpid
    txid
    contract_address
    contract_version
    password
    shares
    message
    name
    is_random
    total
    total_remaining
    creation_time
    last_updated_time
    duration
    chain_id
    token {
        ${TOKEN_FIELDS}
    }
    creator {
        ${USER_FIELDS}
    }
    claimers {
        ${USER_FIELDS}
    }
`

export async function getRedPacketTxid(rpid: string) {
    const { SUBGRAPH_URL } = getRedPacketConstants(await getChainId())
    const response = await fetch(SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            query: `
            {
                redPackets (where: { rpid: "${rpid.toLowerCase()}" }) {
                    ${RED_PACKET_FIELDS}
                }
            }
            `,
        }),
    })

    const {
        data: { redPackets },
    } = (await response.json()) as { data: { redPackets: RedPacketSubgraphOutMask[] } }

    return redPackets[0] ? redPackets[0].txid : null
}

export async function getRedPacketHistory(address: string, chainId: ChainId) {
    const { SUBGRAPH_URL } = getRedPacketConstants(await getChainId())
    const response = await fetch(SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            query: `
            {
                redPackets (where: { creator: "${address.toLowerCase()}" }) {
                    ${RED_PACKET_FIELDS}
                }
            }
            `,
        }),
    })

    const {
        data: { redPackets },
    } = (await response.json()) as { data: { redPackets: RedPacketSubgraphOutMask[] } }

    return redPackets
        .map((x) => {
            const redPacketSubgraphInMask = { ...x, token: tokenIntoMask(x.token) } as RedPacketSubgraphInMask
            const redPacketBasic = pick(redPacketSubgraphInMask, redPacketBasicKeys)
            redPacketBasic.creation_time = redPacketSubgraphInMask.creation_time * 1000
            const sender = {
                address: redPacketSubgraphInMask.creator.address,
                name: redPacketSubgraphInMask.creator.name,
                message: redPacketSubgraphInMask.message,
            }
            const network = getChainName(redPacketSubgraphInMask.chain_id)

            let token
            if (redPacketSubgraphInMask.token.type === EthereumTokenType.Native) {
                const detailed = getChainDetailed(redPacketSubgraphInMask.token.chainId)
                token = {
                    ...redPacketSubgraphInMask.token,
                    name: detailed?.nativeCurrency.name ?? 'Ether',
                    symbol: detailed?.nativeCurrency.symbol ?? 'ETH',
                } as NativeTokenDetailed
                redPacketSubgraphInMask.token = token
            }
            const payload = {
                sender,
                network,
                token_type: redPacketSubgraphInMask.token.type,
                token: pick(redPacketSubgraphInMask.token, ['symbol', 'address', 'name', 'decimals']),
                ...redPacketBasic,
            } as RedPacketJSONPayload

            return {
                payload,
                ...redPacketSubgraphInMask,
            } as RedPacketHistory
        })
        .sort((a, b) => b.creation_time - a.creation_time)
}
