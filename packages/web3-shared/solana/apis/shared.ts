import type { ChainId } from '../types'
import { NETWORK_ENDPOINTS } from '../constants'
import type { RpcOptions } from './types'

let id = 0
export async function requestRPC<T = unknown>(chainId: ChainId, options: RpcOptions): Promise<T> {
    const endpoint = NETWORK_ENDPOINTS[chainId]
    id += 1
    const res = await globalThis.fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...options,
            jsonrpc: '2.0',
            id,
        }),
    })
    return res.json()
}

export async function fetchJSON<T = unknown>(url: string): Promise<T> {
    const res = await globalThis.fetch(url)
    return res.json()
}
