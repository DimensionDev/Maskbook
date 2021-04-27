import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { send } from './send'

let id = 0

export async function request(
    payload: Omit<JsonRpcPayload, 'id' | 'jsonrpc'>,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
) {
    return new Promise((resolve, reject) => {
        send(
            {
                jsonrpc: '2.0',
                id,
                ...payload,
            },
            (err, response) => {
                if (err) reject(err)
                else resolve(response?.result)
            },
        )
        id++
    })
}
