import { pick } from 'lodash-es'
import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { INTERNAL_send } from './send'

let id = 0

export async function request<T extends unknown>(requestArguments: RequestArguments) {
    return new Promise<T>((resolve, reject) => {
        id++
        INTERNAL_send(
            {
                jsonrpc: '2.0',
                id,
                params: [],
                ...requestArguments,
            },
            (error, response) => {
                if (error || response?.error) reject(error ?? response?.error)
                else resolve(response?.result)
            },
        )
    })
}

export async function requestSend(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
) {
    try {
        id++
        callback(null, {
            jsonrpc: '2.0',
            id,
            result: await request(pick(payload, ['method', 'params'])),
        })
    } catch (e) {
        callback(e)
    }
}
