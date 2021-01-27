import { CMC_LATEST_BASE_URL } from '../../constants/trending'

export interface PriceState {
    id: number
    mc: number
    p: number
    p1h: number
    p7d: number
    p24h: number
    v: number
}

let webSocket: WebSocket | null = null
let timeout = 250
let connectInterval: any = null

function checkWebSocket(coinId: number) {
    if (!webSocket || webSocket.readyState === WebSocket.CLOSED) {
        openWebSocket(coinId)
    }
}

function openWebSocket(coinId: number): void {
    if (!webSocket || webSocket.readyState === WebSocket.CLOSED) {
        try {
            const socket = new WebSocket(CMC_LATEST_BASE_URL)
            socket.onopen = () => {
                webSocket = socket
                if (!connectInterval) {
                    clearTimeout(connectInterval)
                }

                const params = {
                    method: 'subscribe',
                    id: 'price',
                    data: {
                        cryptoIds: [coinId],
                    },
                }
                webSocket.send(JSON.stringify(params))
            }

            socket.onerror = (error) => {
                console.error(error)
                webSocket?.close()
                webSocket = null
            }

            socket.onclose = () => {
                webSocket = null
                connectInterval = setTimeout(checkWebSocket, timeout, coinId)
            }
        } catch (error) {
            console.error(error)
            webSocket = null
        }
    }
}

export function getPriceStat(coinId: number) {
    openWebSocket(coinId)
    return new Promise<PriceState>((resolve, reject) => {
        if (webSocket) {
            webSocket.onmessage = (ev) => {
                if (typeof ev.data !== 'string') {
                    return
                }
                try {
                    const prices = JSON.parse(ev.data)
                    console.log(ev.data)
                    resolve(prices['d']['cr'])
                } catch (error) {
                    console.log(error)
                    reject(error)
                }
            }
        }
    })
}
