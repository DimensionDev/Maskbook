import type { GasNow } from '@masknet/web3-shared'
import { currentGasNowSettings } from '../settings'

export function connectGasNow() {
    const GAS_NOW_API = 'wss://www.gasnow.org/ws'
    const gasNowSocket = new WebSocket(GAS_NOW_API)
    let timer: NodeJS.Timeout
    gasNowSocket.addEventListener('open', () => {
        if (timer) clearTimeout(timer)
        console.log('GasNow websocket connected.')
    })
    gasNowSocket.addEventListener('message', (event) => {
        const gasNow: GasNow = JSON.parse(event.data).data.gasPrices
        currentGasNowSettings.value = gasNow
    })
    gasNowSocket.addEventListener('close', () => {
        console.log('GasNow WebSocket closed, try to reconnect...')
        currentGasNowSettings.value = null
        timer = setTimeout(connectGasNow, 1000)
    })
}
