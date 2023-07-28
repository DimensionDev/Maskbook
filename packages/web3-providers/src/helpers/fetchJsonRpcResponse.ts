import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { RequestID } from '@masknet/web3-shared-evm'
import { fetchSquashedJSON } from './fetchJSON.js'

async function resolveRequestKey(request: Request) {
    try {
        const body: JsonRpcPayload = await request.json()
        return RequestID.fromPayload(request.url, body).ID ?? ''
    } catch {
        return ''
    }
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
