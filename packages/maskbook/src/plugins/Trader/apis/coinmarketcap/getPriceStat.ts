import { EventEmitter } from 'events'
import { CMC_LATEST_BASE_URL } from '../../constants/trending'

const MAX_RETRY = 3
let webSocket: WebSocket | null = null
let retry = MAX_RETRY
const Event = new EventEmitter()

export interface PriceState {
    id: number
    mc: number
    p: number
    p1h: number
    p7d: number
    p24h: number
    v: number
}

const WATCHED_COINS: number[] = []
const WATCHED_PRICES = new Map<string, PriceState>()

enum ERROR_TYPE {
    WS_CONNECT_ERROR,
    NOT_SUBSCRIBE,
}

async function connectWebSocket() {
    return new WebSocket(CMC_LATEST_BASE_URL)
}

const msgData = {
    method: 'subscribe',
    id: 'price',
    data: {
        cryptoIds: WATCHED_COINS,
    },
}

function syncPricesFromWS(coinIds: number[]) {
    Event.addListener('unsubscribe', (msg: number) => {
        WATCHED_COINS.splice(WATCHED_COINS.indexOf(msg, 1))
        if (WATCHED_COINS.length > 0) {
            webSocket?.send(JSON.stringify(msgData))
            return
        }

        if (webSocket) {
            webSocket.close()
            webSocket = null
        }
    })

    Event.addListener('subscribe', async (msg: number) => {
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
            if (WATCHED_COINS.some((x) => x === msg)) {
                return
            }

            WATCHED_COINS.push(msg)
            webSocket.send(JSON.stringify(msgData))
            return
        }
        const client = await connectWebSocket()

        client.onopen = () => {
            webSocket = client
            coinIds.map((x) => {
                if (WATCHED_COINS.indexOf(x) === -1) {
                    WATCHED_COINS.push(x)
                }
            })

            if (WATCHED_COINS.length > 0) {
                client.send(JSON.stringify(msgData))
            }
        }
        client.onerror = (error) => {
            client.close()
            webSocket = null
            console.log(error)
        }
        client.onclose = () => {
            console.log('close')
            webSocket = null
        }

        client.onmessage = (ev) => {
            if (typeof ev.data !== 'string') {
                return
            }
            try {
                const jsondata = JSON.parse(ev.data)
                Event.emit(jsondata.id, jsondata)
            } catch (e) {
                console.error(e)
            }
        }
    })
}

export function getCoinPrice(coinId: number) {
    if (!WATCHED_COINS.some((x) => x === coinId)) {
        throw new Error('coin not subscribe!')
    }
    if (!webSocket) {
        throw new Error('websocket connect error')
    }
    if (webSocket && webSocket.readyState === WebSocket.CLOSED) {
        throw new Error('websocket closed')
    }
    return WATCHED_PRICES.get(coinId.toString())
}

export function subscribeCoinPrce(coinId: number) {
    syncPricesFromWS([coinId])
    Event.addListener(coinId.toString(), (data) => {
        WATCHED_PRICES.set(coinId.toString(), data)
    })

    Event.emit('subscribe', coinId)
}

export function unsubscribeCoinPrce(coinId: number) {
    Event.emit('unsubscribe', coinId)
}
