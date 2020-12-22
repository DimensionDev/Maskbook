import { ITO_SUBGRAPH_URL } from '../constants'
import type { ITO_JSONPayload } from '../types'

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
        data: ITO_JSONPayload
    }
    return data
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
                pool: ITO_JSONPayload
            }[]
        }
    }
    return data.sellInfos.map((x) => x.pool)
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
                pool: ITO_JSONPayload
            }[]
        }
    }
    return data.buyInfos.map((x) => x.pool)
}
