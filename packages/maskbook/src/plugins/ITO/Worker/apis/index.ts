import { ChainId, getITOConstants } from '@masknet/web3-shared'
import { ApolloClient, InMemoryCache, QueryOptions, gql } from '@apollo/client'
import { first, omit } from 'lodash-es'
import { currentChainIdSettings } from '../../../Wallet/settings'
import { payloadIntoMask } from '../../SNSAdaptor/helpers'
import type { JSON_PayloadOutMask } from '../../types'

const TRADER_FIELDS = `
    address
    name
`

const TOKEN_FIELDS = `
    chain_id
    type
    address
    name
    symbol
    decimals
`

const POOL_FIELDS = `
    contract_address
    qualification_address
    pid
    password
    message
    limit
    total
    total_remaining
    chain_id
    start_time
    end_time
    creation_time
    token {
        ${TOKEN_FIELDS}
    }
    seller {
        address
    }
    buyers (first: 1) {
        address
        name
    }
    exchange_amounts
    exchange_tokens {
        ${TOKEN_FIELDS}
    }
`

async function fetchFromMarketSubgraph<T>(query: QueryOptions<{ [variable: string]: any }, any>, chainId?: ChainId) {
    const subgraphURL = getITOConstants(chainId ? chainId : currentChainIdSettings.value).SUBGRAPH_URL
    if (!subgraphURL) return null

    const apolloClient = new ApolloClient({
        uri: subgraphURL,
        cache: new InMemoryCache(),
    })

    const { data }: { data: T } = await apolloClient.query(query)

    return data
}

export async function getTradeInfo(pid: string, trader: string) {
    const data = await fetchFromMarketSubgraph<{
        buyInfos: {
            buyer: {
                address: string
                name: string
            }
            token: JSON_PayloadOutMask['token']
            amount: string
            amount_sold: string
            amount_bought: string
        }[]
        sellInfos: {
            buyer: {
                address: string
                name: string
            }
            token: JSON_PayloadOutMask['token']
            amount: string
        }[]
        destructInfos: {
            buyer: {
                address: string
                name: string
            }
            token: JSON_PayloadOutMask['token']
            amount: string
        }[]
    }>({
        query: gql`
            query ($pid: String!, $trader: String!) {
                buyInfos (where: { pool: $pid, buyer: $trader }) {
                    buyer {
                        ${TRADER_FIELDS}
                    }
                    token {
                        ${TOKEN_FIELDS}
                    }
                    amount
                    amount_sold
                    amount_bought
                }
                sellInfos (where: { pool: $pid, seller: $trader }) {
                    seller {
                        address
                    }
                    amount
                }
                destructInfos (where: { pool: $pid, seller: $trader }) {
                    seller {
                        address
                    }
                    amount
                }
            }
        `,
        variables: {
            pid: pid.toLowerCase(),
            trader: trader.toLowerCase(),
        },
    })

    if (!data?.buyInfos) throw new Error('Failed to load trade info.')
    return {
        buyInfo: first(data.buyInfos),
        sellInfo: first(data.sellInfos),
        destructInfo: first(data.destructInfos),
    }
}

export async function getPool(pid: string) {
    const data = await fetchFromMarketSubgraph<{
        pool: JSON_PayloadOutMask | null
    }>({
        query: gql`
            query ($pid: String!){
                pool (id: $pid) {
                    ${POOL_FIELDS}
                }
            }
        `,
        variables: {
            pid: pid.toLowerCase(),
        },
    })

    if (!data?.pool) throw new Error('Failed to load payload.')
    return payloadIntoMask(data.pool)
}

export async function getAllPoolsAsSeller(address: string, page: number) {
    const data = await fetchFromMarketSubgraph<{
        sellInfos: {
            pool: JSON_PayloadOutMask & {
                exchange_in_volumes: string[]
                exchange_out_volumes: string[]
            }
        }[]
    }>({
        query: gql`
            query ($seller: String!, $page: Int, $skip: Int) {
                sellInfos (
                    orderBy: timestamp,
                    orderDirection: desc,
                    first: 50,
                    skip: $skip,
                    where: { seller: $seller }) {
                        pool {
                            ${POOL_FIELDS}
                            exchange_in_volumes
                            exchange_out_volumes
                        }
                }
            },
        `,
        variables: {
            seller: address.toLowerCase(),
            page,
            skip: page * 50,
        },
    })
    if (!data?.sellInfos) return []
    return data.sellInfos.map((x) => {
        const pool = payloadIntoMask(omit(x.pool, ['exchange_in_volumes', 'exchange_out_volumes']))
        return {
            pool,
            exchange_in_volumes: x.pool.exchange_in_volumes,
            exchange_out_volumes: x.pool.exchange_out_volumes,
        }
    })
}

export async function getAllPoolsAsBuyer(address: string, chainId: ChainId) {
    const data = await fetchFromMarketSubgraph<{
        buyInfos: {
            pool: JSON_PayloadOutMask & {
                exchange_in_volumes: string[]
                exchange_out_volumes: string[]
            }
        }[]
    }>(
        {
            query: gql`
                query ($buyer: String!) {
                    buyInfos (where: { buyer: $buyer }) {
                        pool {
                            ${POOL_FIELDS}
                            exchange_in_volumes
                            exchange_out_volumes
                        }
                    }
                }
            `,
            variables: {
                buyer: address.toLowerCase(),
            },
        },
        chainId,
    )
    if (!data?.buyInfos) return []
    return data.buyInfos.map((x) => {
        const pool = payloadIntoMask(omit(x.pool, ['exchange_in_volumes', 'exchange_out_volumes']))
        return {
            pool,
            exchange_in_volumes: x.pool.exchange_in_volumes,
            exchange_out_volumes: x.pool.exchange_out_volumes,
        }
    })
}
