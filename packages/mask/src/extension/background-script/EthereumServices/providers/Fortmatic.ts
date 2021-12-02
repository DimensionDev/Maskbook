import Web3 from 'web3'
import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { defer } from '@masknet/shared-base'
import { EVM_Messages } from '../../../../plugins/EVM/messages'

//#region redirect requests to the content page
let id = 0

async function request(requestArguments: RequestArguments) {
    id += 1
    const requestId = id
    const [deferred, resolve, reject] = defer<any, Error | null>()

    function onResponse({ payload, result, error }: EVM_Messages['FORTMATIC_PROVIDER_RPC_RESPONSE']) {
        if (payload.id !== requestId) return
        if (error) reject(error)
        else resolve(result)
    }

    setTimeout(() => reject(new Error('The request is timeout.')), 45 * 1000)
    EVM_Messages.events.FORTMATIC_PROVIDER_RPC_RESPONSE.on(onResponse)
    EVM_Messages.events.FORTMATIC_PROVIDER_RPC_REQUEST.sendToVisiblePages({
        payload: {
            jsonrpc: '2.0',
            id: requestId,
            params: [],
            ...requestArguments,
        },
    })

    deferred.finally(() => {
        EVM_Messages.events.FORTMATIC_PROVIDER_RPC_RESPONSE.off(onResponse)
    })

    return deferred
}

function send(payload: JsonRpcPayload, callback: (error: Error | null, response?: JsonRpcResponse) => void) {
    request({
        method: payload.method,
        params: payload.params,
    })
        .then((result) => {
            callback(null, {
                id: payload.id as number,
                jsonrpc: '2.0',
                result,
            })
        })
        .catch((error) => {
            callback(error)
        })
}
//#endregion

let web3: Web3 | null = null

export function createProvider() {
    return {
        request,
        send,
        sendAsync: send,
    }
}

export function createWeb3() {
    if (web3) return web3
    web3 = new Web3(createProvider())
    return web3
}

export async function requestAccounts() {
    const web3 = createWeb3()
    const chainId = await web3.eth.getChainId()
    const accounts = await web3.eth.requestAccounts()
    return {
        chainId,
        accounts,
    }
}
