import io from 'socket.io-client'
import {
    SocketRequestNameSpace,
    SocketRequestType,
    type SocketNameSpace,
    type SocketRequestBody,
    type SocketResponseBody,
    type ZerionAssetResponseBody,
} from './types.js'

const ZERION_API = 'wss://api-v4.zerion.io'
// cspell:disable-next-line
const ZERION_TOKEN = 'Mask.yEUEfDnoxgLBwNEcYPVussxxjdrGwapj'

let socket: SocketIOClient.Socket | null = null

function createSocket(namespace: SocketRequestNameSpace = SocketRequestNameSpace.Address) {
    if (socket?.connected) return socket
    if (socket) socket.removeAllListeners()
    return (socket = io(`${ZERION_API}/${namespace}`, {
        transports: ['websocket'],
        query: {
            api_token: ZERION_TOKEN,
        },
        // disable the auto reconnection
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
        if (typeof requestValue === 'string') {
            return responseMetaValue?.toLowerCase() === requestValue.toLowerCase()
        }
        return responseMetaValue === requestValue
    })
}

function subscribeFromZerion(
    socketNamespace: SocketNameSpace,
    requestBody: SocketRequestBody,
    type = SocketRequestType.SUBSCRIBE,
) {
    return new Promise<SocketResponseBody>((resolve) => {
        const { socket, namespace } = socketNamespace
        const model = requestBody.scope[0]
        socket.emit(type, requestBody)
        socket.on(`received ${namespace} ${model}`, (data: SocketResponseBody) => {
            if (verify(requestBody, data)) {
                resolve(data)
            }
        })
    })
}

export async function getAssetsList(address: string, scope: string) {
    return (await subscribeFromZerion(
        {
            namespace: SocketRequestNameSpace.Address,
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
