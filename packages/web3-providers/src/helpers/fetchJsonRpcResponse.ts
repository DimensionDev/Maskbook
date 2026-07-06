import type { JsonRpcRequest, JsonRpcResponse } from '@masknet/web3-shared-base'
import { fetchSquashedJSON } from './fetchJSON.js'
import stringify from 'json-stable-stringify'

async function resolveRequestKey(request: Request) {
    try {
        const body: JsonRpcRequest = await request.json()
        return stringify([request.url, body.method, body.params])
    } catch {
        return ''
    }
}

export async function fetchJsonRpcResponse(url: string, payload: JsonRpcRequest, init?: RequestInit) {
    return fetchSquashedJSON<JsonRpcResponse>(
        url,
        {
            ...init,
            method: 'POST',
            headers: init?.headers ?? {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
        {
            resolver: resolveRequestKey,
        },
    )
}
