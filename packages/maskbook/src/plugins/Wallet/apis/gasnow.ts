import type { GasNow } from '@dimensiondev/web3-shared'
import { currentGasNowSettings } from '../settings'

export function connectGasNow() {
    const GAS_NOW_API = 'wss://www.gasnow.org/ws'
    const gasNowSocket = new WebSocket(GAS_NOW_API)
    let timer: NodeJS.Timeout
    gasNowSocket.onopen = () => {
        if (timer) clearTimeout(timer)
        console.log('GasNow websocket connected.')
    }
    gasNowSocket.onmessage = (event) => {
        const gasNow: GasNow = JSON.parse(event.data).data.gasPrices
        currentGasNowSettings.value = gasNow
    }
    gasNowSocket.onclose = () => {
        console.log('GasNow websocket closed, try to reconnect...')
        currentGasNowSettings.value = null
        timer = setTimeout(connectGasNow, 1000)
    }
}
