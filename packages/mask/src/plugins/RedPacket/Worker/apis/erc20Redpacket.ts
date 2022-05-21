import { isSameAddress, FungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, getTokenConstants, getRedPacketConstants, chainResolver } from '@masknet/web3-shared-evm'
import stringify from 'json-stable-stringify'
import { first } from 'lodash-unified'
import { tokenIntoMask } from '../../../ITO/SNSAdaptor/helpers'
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
    token: Omit<FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>, 'chainId'> & {
        chain_id: ChainId
    }
    total: string
    total_remaining: string
    txid: string
}

async function fetchFromRedPacketSubgraph<T>(chainId: ChainId, query: string) {
    const { SUBGRAPH_URL } = getRedPacketConstants(chainId)
    if (!SUBGRAPH_URL) return null
    try {
        const response = await fetch(SUBGRAPH_URL, {
            method: 'POST',
            mode: 'cors',
            body: stringify({ query }),
        })
        const { data } = (await response.json()) as {
            data: T
        }
        return data
    } catch (error) {
        return null
    }
}

export async function getRedPacketTxid(chainId: ChainId, rpid: string) {
    const data = await fetchFromRedPacketSubgraph<{ redPackets: RedpacketFromSubgraphType[] }>(
        chainId,
        `
    {
        redPackets (where: { rpid: "${rpid.toLowerCase()}" }) {
            txid
        }
    }
    `,
    )
    return first(data?.redPackets)?.txid
}

export async function getRedPacketHistory(chainId: ChainId, address: string) {
    const { NATIVE_TOKEN_ADDRESS } = getTokenConstants(chainId)

    const data = await fetchFromRedPacketSubgraph<{ redPackets: RedpacketFromSubgraphType[] }>(
        chainId,
        `
    {
        redPackets (where: { creator: "${address.toLowerCase()}" }) {
            ${RED_PACKET_FIELDS}
        }
    }
    `,
    )

    if (!data?.redPackets) return []

    return data.redPackets
        .map((x) => {
            const token = tokenIntoMask({ ...x.token }) as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>
            if (isSameAddress(x.token.address, NATIVE_TOKEN_ADDRESS)) {
                const nativeCurrency = chainResolver.nativeCurrency(x.token.chain_id ?? chainId)
                if (nativeCurrency) {
                    token.name = nativeCurrency.name
                    token.symbol = nativeCurrency.symbol
                }
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
                network: chainResolver.chainName(x.chain_id),
                token,
                claimers: x.claimers,
                total_remaining: x.total_remaining,
                block_number: x.block_number,
            }

            return redpacketPayload
        })
        .sort((a, b) => b.creation_time - a.creation_time)
}

export * from './nftRedpacket'
