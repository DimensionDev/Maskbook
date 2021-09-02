import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { INTERNAL_send, SendOverrides } from './send'

let id = 0

export async function request<T extends unknown>(requestArguments: RequestArguments, overrides?: SendOverrides) {
    return new Promise<T>((resolve, reject) => {
        id += 1
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
            overrides,
        )
    })
}

export async function requestWithoutPopup<T extends unknown>(
    requestArguments: RequestArguments,
    overrides?: SendOverrides,
) {
    return new Promise<T>((resolve, reject) => {
        id += 1
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
            {
                ...overrides,
                disablePopup: true,
            },
        )
    })
}

export async function requestSend(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
) {
    id += 1
    await INTERNAL_send(
        {
            ...payload,
            id,
        },
        callback,
    )
}

export async function requestSendWithoutPopup<T extends unknown>(
    payload: JsonRpcPayload,
    callback: (error: Error | null, response?: JsonRpcResponse) => void,
) {
    id += 1
    await INTERNAL_send(
        {
            ...payload,
            id,
        },
        callback,
        {
            disablePopup: true,
        },
    )
}
