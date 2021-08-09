import { omit } from 'lodash-es'
import type { GasNow } from '@masknet/web3-shared'
import { currentGasNowSettings } from '../settings'

export function connectGasNow() {
    const GAS_NOW_API = 'wss://www.gasnow.org/ws/gasprice'
    const gasNowSocket = new WebSocket(GAS_NOW_API)
    let timer: NodeJS.Timeout

    const onOpen = () => {
        if (timer) clearTimeout(timer)
        console.log('GasNow websocket connected.')
    }
    const onMessage = (event: MessageEvent<any>) => {
        const gasNow = JSON.parse(event.data).data
        currentGasNowSettings.value = omit(gasNow, ['timestamp']) as GasNow
    }
    const onClose = () => {
        console.log('GasNow WebSocket closed, try to reconnect...')
        currentGasNowSettings.value = null
        timer = setTimeout(connectGasNow, 1000)
    }

    gasNowSocket.addEventListener('open', onOpen)
    gasNowSocket.addEventListener('message', onMessage)
    gasNowSocket.addEventListener('close', onClose)

    return () => {
        gasNowSocket.removeEventListener('open', onOpen)
        gasNowSocket.removeEventListener('message', onMessage)
        gasNowSocket.removeEventListener('close', onClose)
        gasNowSocket.close()
    }
}
