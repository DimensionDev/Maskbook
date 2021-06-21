import io from 'socket.io-client'
import type {
    SocketRequestBody,
    SocketNameSpace,
    SocketResponseBody,
    ZerionTransactionResponseBody,
    ZerionAssetResponseBody,
} from '../types'

const ZERION_API = 'wss://api-v4.zerion.io'

//TODO: get token from ci env
const ZERION_TOKEN = 'Mask.yEUEfDnoxgLBwNEcYPVussxxjdrGwapj'

export const addressSocket = {
    namespace: 'address',
    socket: io(`${ZERION_API}/address`, {
        transports: ['websocket'],
        timeout: 60000,
        reconnection: false,
        reconnectionAttempts: 0,
        query: {
            api_token: ZERION_TOKEN,
        },
    }),
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

export async function getTransactionList(address: string, page?: number, size = 30) {
    return (await subscribeFromZerion(addressSocket, {
        scope: ['transactions'],
        payload: {
            address,
            currency: 'usd',
            transactions_limit: size,
            transactions_offset: (page ?? 0) * size,
            transactions_search_query: '',
        },
    })) as ZerionTransactionResponseBody
}

export async function getAssetsList(address: string) {
    return (await subscribeFromZerion(addressSocket, {
        scope: ['assets'],
        payload: {
            address,
            currency: 'usd',
        },
    })) as ZerionAssetResponseBody
}
