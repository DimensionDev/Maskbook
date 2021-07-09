import type { GasNow } from '@masknet/web3-shared'
import { currentGasNowSettings } from '../settings'
import { omit } from 'lodash-es'

export function connectGasNow() {
    const GAS_NOW_API = 'wss://www.gasnow.org/ws/gasprice'
    const gasNowSocket = new WebSocket(GAS_NOW_API)
    let timer: NodeJS.Timeout
    gasNowSocket.addEventListener('open', () => {
        if (timer) clearTimeout(timer)
        console.log('GasNow websocket connected.')
    })
    gasNowSocket.addEventListener('message', (event) => {
        const gasNow = JSON.parse(event.data).data
        currentGasNowSettings.value = omit(gasNow, ['timestamp']) as GasNow
    })
    gasNowSocket.addEventListener('close', () => {
        console.log('GasNow WebSocket closed, try to reconnect...')
        currentGasNowSettings.value = null
        timer = setTimeout(connectGasNow, 1000)
    })
}
