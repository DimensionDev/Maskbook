import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { fetchSquashedJSON } from './fetchJSON.js'

function resolveRequestKey(request: Request) {
    return ''
}

export async function fetchJsonRpcResponse(url: string, payload: JsonRpcPayload, init?: RequestInit) {
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
