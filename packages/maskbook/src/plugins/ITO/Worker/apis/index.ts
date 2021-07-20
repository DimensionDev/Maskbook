import { getITOConstants } from '@masknet/web3-shared'
import stringify from 'json-stable-stringify'
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

export async function getTradeInfo(pid: string, trader: string) {
    const response = await fetch(getITOConstants(currentChainIdSettings.value).SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: stringify({
            query: `
            {
                buyInfos (where: { pool: "${pid.toLowerCase()}", buyer: "${trader.toLowerCase()}" }) {
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
                sellInfos (where: { pool: "${pid.toLowerCase()}", seller: "${trader.toLowerCase()}" }) {
                    seller {
                        address
                    }
                    amount
                }
                destructInfos (where: { pool: "${pid.toLowerCase()}", seller: "${trader.toLowerCase()}" }) {
                    seller {
                        address
                    }
                    amount
                }
            }
            `,
        }),
    })
    const { data } = (await response.json()) as {
        data: {
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
        }
    }
    if (!data.buyInfos) throw new Error('Failed to load trade info.')
    return {
        buyInfo: first(data.buyInfos),
        sellInfo: first(data.sellInfos),
        destructInfo: first(data.destructInfos),
    }
}

export async function getPool(pid: string) {
    const response = await fetch(getITOConstants(currentChainIdSettings.value).SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: stringify({
            query: `
            {
                pool (id: "${pid.toLowerCase()}") {
                    ${POOL_FIELDS}
                }
            }
            `,
        }),
    })

    const { data } = (await response.json()) as {
        data: {
            pool: JSON_PayloadOutMask | null
        }
    }

    if (!data.pool) throw new Error('Failed to load payload.')
    return payloadIntoMask(data.pool)
}

export async function getAllPoolsAsSeller(address: string, page: number) {
    const response = await fetch(getITOConstants(currentChainIdSettings.value).SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: stringify({
            query: `
            {
                sellInfos ( orderBy: timestamp, orderDirection: desc, first: 50, skip: ${
                    page * 50
                }, where: { seller: "${address.toLowerCase()}" }) {
                    pool {
                        ${POOL_FIELDS}
                        exchange_in_volumes
                        exchange_out_volumes
                    }
                }
            }
            `,
        }),
    })
    const { data } = (await response.json()) as {
        data: {
            sellInfos: {
                pool: JSON_PayloadOutMask & {
                    exchange_in_volumes: string[]
                    exchange_out_volumes: string[]
                }
            }[]
        }
    }
    return data.sellInfos.map((x) => {
        const pool = payloadIntoMask(omit(x.pool, ['exchange_in_volumes', 'exchange_out_volumes']))
        return {
            pool,
            exchange_in_volumes: x.pool.exchange_in_volumes,
            exchange_out_volumes: x.pool.exchange_out_volumes,
        }
    })
}

export async function getAllPoolsAsBuyer(address: string) {
    const response = await fetch(getITOConstants(currentChainIdSettings.value).SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: stringify({
            query: `
            {
                buyInfos (where: { buyer: "${address.toLowerCase()}" }) {
                    pool {
                        ${POOL_FIELDS}
                        exchange_in_volumes
                        exchange_out_volumes
                    }
                }
            }
            `,
        }),
    })
    const { data } = (await response.json()) as {
        data: {
            buyInfos: {
                pool: JSON_PayloadOutMask & {
                    exchange_in_volumes: string[]
                    exchange_out_volumes: string[]
                }
            }[]
        }
    }
    return data
        ? data.buyInfos.map((x) => {
              const pool = payloadIntoMask(omit(x.pool, ['exchange_in_volumes', 'exchange_out_volumes']))
              return {
                  pool,
                  exchange_in_volumes: x.pool.exchange_in_volumes,
                  exchange_out_volumes: x.pool.exchange_out_volumes,
              }
          })
        : []
}
