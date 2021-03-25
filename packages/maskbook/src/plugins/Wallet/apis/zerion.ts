import type { SocketRequestBody, SocketNameSpace, SocketResponseBody } from '../types'

const ZERION_API = 'wss://api-v4.zerion.io/'

//TODO: get token from ci env
const ZERION_TOKEN = 'Zerion.oSQAHALTonDN9HYZiYSX5k6vnm4GZNcM'

export const addressSocket = {
    namespace: 'address',
    socket: io(`${ZERION_API}address`, {
        transports: ['websocket'],
        timeout: 60000,
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

export async function getTransactionList(address: string) {
    return subscribeFromZerion(addressSocket, {
        scope: ['transactions'],
        payload: {
            address,
            currency: ' usd',
        },
    })
}
