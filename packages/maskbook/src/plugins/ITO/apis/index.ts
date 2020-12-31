import { omit } from 'lodash-es'
import { getConstant } from '../../../web3/helpers'
import { ITO_CONSTANTS } from '../constants'
import { payloadIntoMask } from '../helpers'
import type { JSON_PayloadOutMask } from '../types'

const BUYER_FIELDS = `
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
        name
    }
    buyers {
        address
        name
    }
    exchange_amounts
    exchange_tokens {
        ${TOKEN_FIELDS}
    }
`

export async function getBuyInfo(pid: string, buyer: string) {
    const response = await fetch(getConstant(ITO_CONSTANTS, 'SUBGRAPH_URL'), {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            query: `
            {
                buyInfos (where: { pool: "${pid.toLowerCase()}", buyer: "${buyer.toLowerCase()}" }) {
                    pool {
                        ${POOL_FIELDS}
                    }
                    buyer {
                        ${BUYER_FIELDS}
                    }
                    token {
                        ${TOKEN_FIELDS}
                    }
                    amount_sold
                    amount_bought
                }
            }
            `,
        }),
    })
    const { data } = (await response.json()) as {
        data: {
            buyInfos: {
                pool: JSON_PayloadOutMask
                buyer: {
                    address: string
                    name: string
                }
                token: JSON_PayloadOutMask['token']
                amount_sold: string
                amount_bought: string
            }[]
        }
    }
    const buyInfo = data.buyInfos[0]
    if (!buyInfo) return
    return {
        ...buyInfo,
        pool: payloadIntoMask(buyInfo.pool),
    }
}

export async function getPool(pid: string) {
    const response = await fetch(getConstant(ITO_CONSTANTS, 'SUBGRAPH_URL'), {
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
    const response = await fetch(getConstant(ITO_CONSTANTS, 'SUBGRAPH_URL'), {
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
    const response = await fetch(getConstant(ITO_CONSTANTS, 'SUBGRAPH_URL'), {
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
