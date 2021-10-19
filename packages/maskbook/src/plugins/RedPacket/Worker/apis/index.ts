import {
    ChainId,
    EthereumTokenType,
    getChainDetailed,
    getChainName,
    getRedPacketConstants,
    NativeTokenDetailed,
} from '@masknet/web3-shared-evm'
import stringify from 'json-stable-stringify'
import { first, pick } from 'lodash-es'
import { tokenIntoMask } from '../../../ITO/SNSAdaptor/helpers'
import { currentChainIdSettings } from '../../../Wallet/settings'
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

async function fetchFromRedPacketSubgraph<T>(query: string) {
    const subgraphURL = getRedPacketConstants(currentChainIdSettings.value).SUBGRAPH_URL
    if (!subgraphURL) return null
    const response = await fetch(subgraphURL, {
        method: 'POST',
        mode: 'cors',
        body: stringify({ query }),
    })
    const { data } = (await response.json()) as {
        data: T
    }
    return data
}

export async function getRedPacketTxid(rpid: string) {
    const data = await fetchFromRedPacketSubgraph<{ redPackets: RedPacketSubgraphOutMask[] }>(`
    {
        redPackets (where: { rpid: "${rpid.toLowerCase()}" }) {
            ${RED_PACKET_FIELDS}
        }
    }
    `)
    return first(data?.redPackets)?.txid
}

export async function getRedPacketHistory(address: string, chainId: ChainId) {
    const data = await fetchFromRedPacketSubgraph<{ redPackets: RedPacketSubgraphOutMask[] }>(`
    {
        redPackets (where: { creator: "${address.toLowerCase()}" }) {
            ${RED_PACKET_FIELDS}
        }
    }
    `)

    if (!data?.redPackets) return []
    return data.redPackets
        .map((x) => {
            const redPacketSubgraphInMask = {
                ...x,
                token: tokenIntoMask(x.token),
                duration: x.duration * 1000,
                creation_time: x.creation_time * 1000,
                last_updated_time: x.last_updated_time * 1000,
            } as RedPacketSubgraphInMask
            const redPacketBasic = pick(redPacketSubgraphInMask, redPacketBasicKeys)
            redPacketBasic.creation_time = redPacketSubgraphInMask.creation_time * 1000
            const sender = {
                address: redPacketSubgraphInMask.creator.address,
                name: redPacketSubgraphInMask.creator.name,
                message: redPacketSubgraphInMask.message,
            }
            const network = getChainName(redPacketSubgraphInMask.chain_id)

            if (redPacketSubgraphInMask.token.type === EthereumTokenType.Native) {
                const detailed = getChainDetailed(redPacketSubgraphInMask.token.chainId)
                const token = {
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

export * from './nftRedpacket'
