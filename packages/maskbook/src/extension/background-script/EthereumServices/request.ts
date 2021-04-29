import type { RequestArguments } from 'web3-core'
import { send } from './send'

let id = 0

export async function request<T extends unknown>(requestArguments: RequestArguments) {
    return new Promise<T>((resolve, reject) => {
        send(
            {
                jsonrpc: '2.0',
                id,
                ...{
                    params: [],
                    ...requestArguments,
                },
            },
            (error, response) => {
                if (error || response?.error) reject(error ?? response?.error)
                else resolve(response?.result)
            },
        )
        id++
    })
}
