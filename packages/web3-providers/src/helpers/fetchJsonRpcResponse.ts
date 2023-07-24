import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { fetchJSON } from './fetchJSON.js'

export async function fetchJsonRpcResponse(url: string, payload: JsonRpcPayload, init?: RequestInit) {
    return fetchJSON<JsonRpcResponse>(url, {
        ...init,
        method: 'POST',
        headers: init?.headers ?? {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
}
