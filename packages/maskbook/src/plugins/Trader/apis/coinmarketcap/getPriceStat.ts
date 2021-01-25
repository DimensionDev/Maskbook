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

function openWebSocket() {
    return new Promise<WebSocket>((resolve, reject) => {
        try {
            const client = new WebSocket(CMC_LATEST_BASE_URL)
            return resolve(client)
        } catch (error) {
            return reject(error)
        }
    })
}

export function getPriceStat(coinId: string) {
    return new Promise<PriceState>((resolve, reject) => {
        openWebSocket()
            .then((client) => {
                client.onopen = () => {
                    const params = {
                        method: 'subscribe',
                        id: 'price',
                        data: {
                            cryptoIds: [coinId],
                        },
                    }
                    client.send(JSON.stringify(params))
                }
                client.onmessage = (ev) => {
                    if (typeof ev.data !== 'string') {
                        return
                    }
                    try {
                        const prices = JSON.parse(ev.data)
                        resolve(prices['d']['cr'])
                    } catch (error) {
                        console.log(error)
                        reject(error)
                    }
                }
            })
            .catch((error) => reject(error))
    })
}
