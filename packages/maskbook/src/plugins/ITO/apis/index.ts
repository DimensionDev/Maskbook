import { omit } from 'lodash-es'
import { ITO_SUBGRAPH_URL } from '../constants'
import { payloadIntoMask } from '../helpers'
import type { JSON_PayloadOutMask } from '../types'

const POOL_FIELDS = `
    contract_address
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
        chain_id
        type
        address
        name
        symbol
        decimals
    }
    seller {
        address
        name
    }
    buyers {
        address
        name
    }
    exchange_amounts
    exchange_tokens {
        chain_id
        type
        address
        name
        symbol
        decimals
    }
`

export async function getPool(pid: string) {
    const response = await fetch(ITO_SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
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
            pool: JSON_PayloadOutMask
        }
    }
    return payloadIntoMask(data.pool)
}

export async function getAllPoolsAsSeller(address: string) {
    const response = await fetch(ITO_SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            query: `
            {
                sellInfos (where: { seller: "${address.toLowerCase()}" }) {
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
    const response = await fetch(ITO_SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
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
    return data.buyInfos.map((x) => {
        const pool = payloadIntoMask(omit(x.pool, ['exchange_in_volumes', 'exchange_out_volumes']))
        return {
            pool,
            exchange_in_volumes: x.pool.exchange_in_volumes,
            exchange_out_volumes: x.pool.exchange_out_volumes,
        }
    })
}
