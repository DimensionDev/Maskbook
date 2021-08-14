import {
    ChainId,
    EthereumTokenType,
    getChainDetailed,
    getChainName,
    getRedPacketConstants,
    NativeTokenDetailed,
} from '@masknet/web3-shared'
import { ApolloClient, InMemoryCache, QueryOptions, gql } from '@apollo/client'
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

async function fetchFromRedPacketSubgraph<T>(query: QueryOptions<{ [variable: string]: any }, any>, chainId?: ChainId) {
    const subgraphURL = getRedPacketConstants(chainId ? chainId : currentChainIdSettings.value).SUBGRAPH_URL
    if (!subgraphURL) return null

    const apolloClient = new ApolloClient({
        uri: subgraphURL,
        cache: new InMemoryCache(),
    })

    const { data }: { data: T } = await apolloClient.query(query)

    return data
}

export async function getRedPacketTxid(rpid: string) {
    const data = await fetchFromRedPacketSubgraph<{ redPackets: RedPacketSubgraphOutMask[] }>({
        query: gql`
            query ($rpid: String!) {
                redPackets (where: { rpid: $rpid }) {
                    ${RED_PACKET_FIELDS}
                }
            }
        `,
        variables: {
            rpid: rpid.toLowerCase(),
        },
    })
    return first(data?.redPackets)?.txid
}

export async function getRedPacketHistory(address: string, chainId: ChainId) {
    const data = await fetchFromRedPacketSubgraph<{ redPackets: RedPacketSubgraphOutMask[] }>({
        query: gql`
            query ($creator: String!) {
                redPackets (where: { creator: $creator }) {
                    ${RED_PACKET_FIELDS}
                }
            }
        `,
        variables: {
            creator: address.toLowerCase(),
        },
    })

    if (!data?.redPackets) return []
    return data.redPackets
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
