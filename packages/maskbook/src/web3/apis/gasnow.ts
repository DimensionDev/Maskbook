import BigNumber from 'bignumber.js'
import type { GasPrice } from '../../plugins/Wallet/types'

const GAS_NOW_API = 'https://www.gasnow.org/api/v3/gas/price'
const WAIT_TIME = 8

interface GasNowData {
    rapid: string //Gwei
    fast: string
    slow: string
    standard: string
    timestamp: number
}
var _LastGasNowResponseData: GasNowData | null = null

function format(price: string): string {
    return Math.round(new BigNumber(price || '0').div(1000000000).toNumber()).toFixed()
}

async function GetGasNowPrice(name: string) {
    const params = new URLSearchParams()
    params.append('utm_source', name)

    try {
        const response = await fetch(`${GAS_NOW_API}?${params.toString()}`)
        return response.json() as Promise<{
            code: number
            data: GasNowData
        }>
    } catch (e) {
        return {
            data: null,
        }
    }
}
export async function getGasPrice(): Promise<GasPrice[]> {
    const timestamp = Date.now() / 1000
    if (!_LastGasNowResponseData || timestamp - _LastGasNowResponseData.timestamp > WAIT_TIME) {
        const { data: gasPrice } = await GetGasNowPrice('maskbook')
        _LastGasNowResponseData = gasPrice
    }

    if (!_LastGasNowResponseData) return []

    return [
        {
            title: 'rapid',
            wait: 15,
            gasPrice: format(_LastGasNowResponseData!.rapid),
        },
        {
            title: 'fast',
            wait: 60,
            gasPrice: format(_LastGasNowResponseData!.fast),
        },
        {
            title: 'slow',
            wait: 600,
            gasPrice: format(_LastGasNowResponseData!.slow),
        },
        {
            title: 'standard',
            wait: 180,
            gasPrice: format(_LastGasNowResponseData!.standard),
        },
    ] as GasPrice[]
}
