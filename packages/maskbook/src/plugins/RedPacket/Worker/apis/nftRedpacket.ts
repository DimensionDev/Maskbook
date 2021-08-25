import { ChainId, EthereumTokenType, getChainName, getNftRedPacketConstants } from '@masknet/web3-shared'
import stringify from 'json-stable-stringify'
import { first, pick } from 'lodash-es'
import { tokenIntoMask } from '../../../ITO/SNSAdaptor/helpers'
import { currentChainIdSettings } from '../../../Wallet/settings'
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
    type
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
    last_updated_time
    duration
    chain_id
    token {
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

async function fetchFromNFTRedPacketSubgraph<T>(query: string) {
    const subgraphURL = getNftRedPacketConstants(currentChainIdSettings.value).SUBGRAPH_URL
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

export async function getNftRedPacketTxid(rpid: string) {
    const data = await fetchFromNFTRedPacketSubgraph<{ redPackets: NftRedPacketSubgraphOutMask[] }>(`
    {
        nftredPackets (where: { rpid: "${rpid.toLowerCase()}" }) {
            ${RED_PACKET_FIELDS}
        }
    }
    `)
    return first(data?.redPackets)?.txid
}

export async function getNftRedPacketHistory(address: string, chainId: ChainId) {
    const data = await fetchFromNFTRedPacketSubgraph<{ nftredPackets: NftRedPacketSubgraphOutMask[] }>(`
    {
        nftredPackets (where: { creator: "${address.toLowerCase()}" }, orderBy: creation_time, orderDirection: desc) {
            ${RED_PACKET_FIELDS}
        }
    }
    `)
    if (!data?.nftredPackets) return []
    return data.nftredPackets
        .map((x) => {
            // @ts-ignore
            const nftRedPacketSubgraphInMask = {
                ...x,
                token: tokenIntoMask(x.token),
                duration: x.duration * 1000,
                creation_time: x.creation_time * 1000,
                last_updated_time: x.last_updated_time * 1000,
            } as NftRedPacketSubgraphInMask
            const redPacketBasic = pick(nftRedPacketSubgraphInMask, redPacketBasicKeys)
            const network = getChainName(nftRedPacketSubgraphInMask.chain_id)
            const sender = {
                address: nftRedPacketSubgraphInMask.creator.address,
                name: nftRedPacketSubgraphInMask.creator.name,
                message: nftRedPacketSubgraphInMask.message,
            }
            const payload = {
                sender,
                network,
                token_type: EthereumTokenType.ERC721,
                token: pick(nftRedPacketSubgraphInMask.token, ['symbol', 'address', 'name', 'decimals']),
                ...redPacketBasic,
            } as NftRedPacketJSONPayload
            // @ts-ignore
            return {
                payload,
                ...nftRedPacketSubgraphInMask,
            } as NftRedPacketHistory
        })
        .sort((r1, r2) => r1.creation_time - r2.creation_time)
}
