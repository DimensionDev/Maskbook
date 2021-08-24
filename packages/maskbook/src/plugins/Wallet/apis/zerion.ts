import io from 'socket.io-client'
import type {
    SocketRequestBody,
    SocketNameSpace,
    SocketResponseBody,
    ZerionTransactionResponseBody,
    ZerionAssetResponseBody,
} from '../types'

const ZERION_API = 'wss://api-v4.zerion.io'
const ZERION_TOKEN = 'Mask.yEUEfDnoxgLBwNEcYPVussxxjdrGwapj'

let socket: SocketIOClient.Socket | null = null

function createSocket() {
    if (socket?.connected) return socket
    if (socket) socket.removeAllListeners()
    return (socket = io(`${ZERION_API}/address`, {
        transports: ['websocket'],
        query: {
            api_token: ZERION_TOKEN,
        },
        // disable the auto reconection
        reconnection: false,
    }))
}

function verify(request: SocketRequestBody, response: any) {
    // each value in request payload must be found in response meta
    return Object.keys(request.payload).every((key) => {
        const requestValue = request.payload[key]
        const responseMetaValue = response.meta[key]
        if (typeof requestValue === 'object') {
            return JSON.stringify(requestValue) === JSON.stringify(responseMetaValue)
        }
        return responseMetaValue === requestValue
    })
}

function subscribeFromZerion(socketNamespace: SocketNameSpace, requestBody: SocketRequestBody) {
    return new Promise<SocketResponseBody>((resolve) => {
        const { socket, namespace } = socketNamespace
        const model = requestBody.scope[0]
        socket.emit('subscribe', requestBody)
        socket.on(`received ${namespace} ${model}`, (data: SocketResponseBody) => {
            if (verify(requestBody, data)) {
                resolve(data)
            }
        })
    })
}

export async function getTransactionList(address: string, scope: string, page?: number, size = 30) {
    return (await subscribeFromZerion(
        {
            namespace: 'address',
            socket: createSocket(),
        },
        {
            scope: [scope],
            payload: {
                address,
                currency: 'usd',
                transactions_limit: size,
                transactions_offset: (page ?? 0) * size,
                transactions_search_query: '',
            },
        },
    )) as ZerionTransactionResponseBody
}

export async function getAssetsList(address: string, scope: string) {
    return (await subscribeFromZerion(
        {
            namespace: 'address',
            socket: createSocket(),
        },
        {
            scope: [scope],
            payload: {
                address,
                currency: 'usd',
            },
        },
    )) as ZerionAssetResponseBody
}
