import { CMC_LATEST_BASE_URL } from '../../constants'
import stringify from 'json-stable-stringify'
import { remove } from 'lodash-es'
import { subscribeCoins } from '../../settings'

type CMCResponse = {
    id: string
    s: string
    d: {
        cr: CoinState
    }
}

/**
 * v: token volume
 * mc: token market cap
 * p1h: price changes with one hour
 * p7d: price changes with a week
 * p24h: price changes with one day
 * p: token price
 */
type CoinState = {
    id: number
    v: number
    mc: number
    p1h: number
    p7d: number
    p24h: number
    p: number
}

let cmc_client: WebSocket
let WATCHED_COINS: number[] = []

const subscribeMessage = {
    method: 'subscribe',
    id: 'price',
    data: {
        cryptoIds: WATCHED_COINS,
    },
    index: 'detail',
}

const unsubscribeMessage = {
    method: 'unsubscribe',
    id: 'unsubscribePrice',
}

export function subscribeCMCPrice(coinId: number) {
    !WATCHED_COINS.some((id) => id === coinId) && WATCHED_COINS.push(coinId)

    if (!cmc_client || cmc_client.readyState === WebSocket.CLOSED) {
        //#region if the connection be closed, reopen new connection and send message
        cmc_client = new WebSocket(CMC_LATEST_BASE_URL)

        cmc_client.onopen = () => cmc_client.send(stringify(subscribeMessage))

        cmc_client.onclose = () => {
            WATCHED_COINS = []
        }

        cmc_client.onmessage = (event: MessageEvent) => {
            //#region set the coin information according to the returned id
            const response = JSON.parse(event.data) as CMCResponse
            if (response.s === '0' && response.d.cr) {
                const coins = JSON.parse(subscribeCoins.value || '{}')

                subscribeCoins.value = JSON.stringify({
                    ...coins,
                    [`${response.d.cr.id}`]: response.d.cr,
                })
            }
        }
    } else if (cmc_client.readyState === WebSocket.OPEN) {
        cmc_client.send(stringify(subscribeMessage))
    }
}

export function unSubscribeCMCPrice(coinId: number) {
    if (cmc_client && cmc_client.readyState === WebSocket.OPEN) {
        remove(WATCHED_COINS, (id) => id === coinId)
        //#region if there are no coins to subscribe, then unsubscribe, otherwise update the list of coins
        cmc_client.send(stringify(WATCHED_COINS.length ? subscribeMessage : unsubscribeMessage))
    }
}
