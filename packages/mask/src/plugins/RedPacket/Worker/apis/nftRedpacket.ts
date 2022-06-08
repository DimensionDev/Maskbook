import { getNftRedPacketConstants, chainResolver, ChainId } from '@masknet/web3-shared-evm'
import stringify from 'json-stable-stringify'
import { first, pick } from 'lodash-unified'
import { tokenIntoMask } from '../../../ITO/SNSAdaptor/helpers'
import type {
    NftRedPacketHistory,
    NftRedPacketJSONPayload,
    NftRedPacketSubgraphInMask,
    NftRedPacketSubgraphOutMask,
} from '../../types'

const redPacketBasicKeys = [
    'contract_address',
    'contract_version',
    'rpid',
    'txid',
    'password',
    'shares',
    'total',
    'creation_time',
    'duration',
]

const TOKEN_FIELDS = `
    address
    name
    symbol
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
    total
    creation_time
    duration
    chain_id
    token: token_contract  {
        ${TOKEN_FIELDS}
    }
    token_contract {
        ${TOKEN_FIELDS}
    }
    token_ids
    creator {
        ${USER_FIELDS}
    }
    claimers {
        ${USER_FIELDS}
    }
`

async function fetchFromNFTRedPacketSubgraph<T>(chainId: ChainId, query: string) {
    const subgraphURL = getNftRedPacketConstants(chainId).SUBGRAPH_URL
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

export async function getNftRedPacketTxid(chainId: ChainId, rpid: string) {
    const data = await fetchFromNFTRedPacketSubgraph<{ redPackets: NftRedPacketSubgraphOutMask[] }>(
        chainId,
        `
    {
        nftredPackets (where: { rpid: "${rpid.toLowerCase()}" }) {
            ${RED_PACKET_FIELDS}
        }
    }
    `,
    )
    return first(data?.redPackets)?.txid
}

const PAGE_SIZE = 5
export async function getNftRedPacketHistory(chainId: ChainId, address: string, page: number) {
    const data = await fetchFromNFTRedPacketSubgraph<{ nftredPackets: NftRedPacketSubgraphOutMask[] }>(
        chainId,
        `
    {
        nftredPackets (
          where: { creator: "${address.toLowerCase()}" },
          orderBy: creation_time,
          orderDirection: desc,
          first: ${PAGE_SIZE},
          skip: ${(page - 1) * PAGE_SIZE}
        ) {
            ${RED_PACKET_FIELDS}
        }
    }
    `,
    )
    if (!data?.nftredPackets) return []
    return data.nftredPackets.map((x) => {
        const nftRedPacketSubgraphInMask = {
            ...x,
            token: tokenIntoMask(x.token),
            token_contract: tokenIntoMask(x.token_contract),
            duration: x.duration * 1000,
            creation_time: x.creation_time * 1000,
        } as NftRedPacketSubgraphInMask
        const redPacketBasic = pick(nftRedPacketSubgraphInMask, redPacketBasicKeys)
        const network = chainResolver.chainNetworkType(nftRedPacketSubgraphInMask.chain_id)
        const sender = {
            address: nftRedPacketSubgraphInMask.creator.address,
            name: nftRedPacketSubgraphInMask.creator.name,
            message: nftRedPacketSubgraphInMask.message,
        }
        const payload = {
            sender,
            network,
            token: pick(nftRedPacketSubgraphInMask.token, ['symbol', 'address', 'name', 'decimals']),
            ...redPacketBasic,
        } as NftRedPacketJSONPayload
        return {
            payload,
            ...nftRedPacketSubgraphInMask,
        } as NftRedPacketHistory
    })
}
