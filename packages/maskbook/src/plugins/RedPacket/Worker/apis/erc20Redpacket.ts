import {
    ChainId,
    FungibleTokenDetailed,
    FungibleTokenOutMask,
    getTokenConstants,
    getRedPacketConstants,
    resolveChainName,
    isSameAddress,
    getChainDetailed,
} from '@masknet/web3-shared'
import stringify from 'json-stable-stringify'
import { first } from 'lodash-es'
import { tokenIntoMask } from '../../../ITO/SNSAdaptor/helpers'
import { currentChainIdSettings } from '../../../Wallet/settings'
import type { RedPacketJSONPayload } from '../../types'

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
    block_number
    contract_version
    password
    shares
    message
    name
    is_random
    total
    total_remaining
    creation_time
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

type RedpacketFromSubgraphType = {
    chain_id: ChainId
    claimers: { name: string; address: string }[]
    contract_address: string
    contract_version: number
    block_number: number
    creation_time: number
    creator: { name: string; address: string }
    duration: number
    is_random: boolean
    message: string
    rpid: string
    shares: number
    token: FungibleTokenOutMask
    total: string
    total_remaining: string
    txid: string
}

async function fetchFromRedPacketSubgraph<T>(query: string) {
    const { SUBGRAPH_URL } = getRedPacketConstants(currentChainIdSettings.value)
    if (!SUBGRAPH_URL) return null
    const response = await fetch(SUBGRAPH_URL, {
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
    const data = await fetchFromRedPacketSubgraph<{ redPackets: RedpacketFromSubgraphType[] }>(`
    {
        redPackets (where: { rpid: "${rpid.toLowerCase()}" }) {
            ${RED_PACKET_FIELDS}
        }
    }
    `)
    return first(data?.redPackets)?.txid
}

export async function getRedPacketHistory(address: string, chainId: ChainId) {
    const { NATIVE_TOKEN_ADDRESS } = getTokenConstants(currentChainIdSettings.value)

    const data = await fetchFromRedPacketSubgraph<{ redPackets: RedpacketFromSubgraphType[] }>(`
    {
        redPackets (where: { creator: "${address.toLowerCase()}" }) {
            ${RED_PACKET_FIELDS}
        }
    }
    `)

    if (!data?.redPackets) return []

    return data.redPackets
        .map((x) => {
            const token = tokenIntoMask({ ...x.token }) as FungibleTokenDetailed
            console.log({ token })
            if (isSameAddress(x.token.address, NATIVE_TOKEN_ADDRESS)) {
                token.name = getChainDetailed(x.token.chain_id)?.nativeCurrency.name
                token.symbol = getChainDetailed(chainId)?.nativeCurrency.symbol
            }

            const redpacketPayload: RedPacketJSONPayload = {
                contract_address: x.contract_address,
                rpid: x.rpid,
                txid: x.txid,
                password: '',
                shares: x.shares,
                is_random: x.is_random,
                total: x.total,
                creation_time: x.creation_time * 1000,
                duration: x.duration * 1000,
                sender: {
                    address: x.creator.address,
                    name: x.creator.name,
                    message: x.message,
                },
                contract_version: x.contract_version,
                network: resolveChainName(x.chain_id),
                token: token,
                claimers: x.claimers,
                total_remaining: x.total_remaining,
                block_number: x.block_number,
            }

            return redpacketPayload
        })
        .sort((a, b) => b.creation_time - a.creation_time)
}

export * from './nftRedpacket'
