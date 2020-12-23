import { ITO_SUBGRAPH_URL } from '../constants'
import { payloadIntoMask } from '../helpers'
import type { JSON_PayloadOutMask } from '../types'

const POOL_FIELDS = `
    contract_address
    pid,
    password
    limit
    total
    total_remaining
    seller {
        address
        name
        message
    }
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
                pool (id: ${pid}) {
                    ${POOL_FIELDS}
                }
            `,
        }),
    })
    const { data } = (await response.json()) as {
        data: JSON_PayloadOutMask
    }
    return payloadIntoMask(data)
}

export async function getAllPoolsAsSeller(address: string) {
    const response = await fetch(ITO_SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            query: `
            {
                sellInfos (where: { seller: ${address} }) {
                    pool {
                        ${POOL_FIELDS}
                    }
                }
            }
            `,
        }),
    })
    const { data } = (await response.json()) as {
        data: {
            sellInfos: {
                pool: JSON_PayloadOutMask
            }[]
        }
    }
    return data.sellInfos.map((x) => x.pool).map(payloadIntoMask)
}

export async function getAllPoolsAsBuyer(address: string) {
    const response = await fetch(ITO_SUBGRAPH_URL, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            query: `
            {
                buyInfos (where: { buyer: ${address} }) {
                    pool {
                        ${POOL_FIELDS}
                    }
                }
            }
            `,
        }),
    })
    const { data } = (await response.json()) as {
        data: {
            buyInfos: {
                pool: JSON_PayloadOutMask
            }[]
        }
    }
    return data.buyInfos.map((x) => x.pool).map(payloadIntoMask)
}
