import { useAsyncRetry } from 'react-use'
import { useChainId } from './useChainId'
import type { GasPrices } from '../types'

const GAS_PRICE_API = 'wss://www.gasnow.org/ws'
const socket = new WebSocket(GAS_PRICE_API)

export function useGasPrices() {
    const chainId = useChainId()
    return useAsyncRetry(() => {
        return new Promise<GasPrices>((resolve) => {
            socket.onmessage = (event) => {
                const gasPrices: GasPrices = JSON.parse(event.data).data.gasPrices
                resolve(gasPrices)
            }
        })
    }, [chainId])
}
