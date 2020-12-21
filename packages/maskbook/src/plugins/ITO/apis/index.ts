import { THEGRAPH_MASK_ITO } from '../constants'
import type { ITO_JSONPayload } from '../types'

export async function getPool(pid: string) {
    const response = await fetch(THEGRAPH_MASK_ITO, {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            query: `
            {
                pool (id: ${pid}) {
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
                }
            }
            `,
        }),
    })
    const { data } = (await response.json()) as {
        data: ITO_JSONPayload
    }
    return data
}

export function getAllPoolsAsSeller(address: string) {}

export function getAllPoolsAsBuyer(address: string) {}
