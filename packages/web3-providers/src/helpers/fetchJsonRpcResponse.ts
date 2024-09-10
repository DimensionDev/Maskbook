import type { JsonRpcRequest, JsonRpcResponseWithError, JsonRpcResponseWithResult } from 'web3-types'
import { RequestID } from '@masknet/web3-shared-evm'
import { fetchSquashedJSON } from './fetchJSON.js'

async function resolveRequestKey(request: Request) {
    try {
        const body: JsonRpcRequest = await request.json()
        return RequestID.fromPayload(request.url, body).ID ?? ''
    } catch {
        return ''
    }
}

export async function fetchJsonRpcResponse(url: string, payload: JsonRpcRequest, init?: RequestInit) {
    return fetchSquashedJSON<JsonRpcResponseWithResult<any> | JsonRpcResponseWithError<any>>(
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
