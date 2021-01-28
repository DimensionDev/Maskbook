import type { GasPrice } from '../../plugins/Wallet/types'

const API_URL = 'https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json'
const KEY = '3dde23a42764905a1115068c38ee99e1c8ef42d37719ad98172763e29f30'

interface GasStationData {
    fast: string
    fastest: string
    safeLow: string
    average: string
    safeLowWait: number
    avgWait: number
    fastWait: number
    fastestWait: number
}

async function GetGasStationPrice() {
    const params = new URLSearchParams()
    params.append('api-key', KEY)

    try {
        const response = await fetch(`${API_URL}?${params.toString()}`, {
            mode: 'cors',
            headers: {
                Accept: 'application/json',
            },
        })
        return response.json() as Promise<GasStationData>
    } catch (e) {
        return null
    }
}

export async function getGasPrice(): Promise<GasPrice[]> {
    const gasPrice = await GetGasStationPrice()
    if (!gasPrice) return []

    return [
        {
            title: 'Rapid',
            gasPrice: gasPrice.fastest,
            wait: gasPrice.fastestWait,
        },
        {
            title: 'Fast',
            gasPrice: gasPrice.fast,
            wait: gasPrice.fastWait,
        },
        {
            title: 'Standard',
            gasPrice: gasPrice.average,
            wait: gasPrice.avgWait,
        },
        {
            title: 'Slow',
            gasPrice: gasPrice.safeLow,
            wait: gasPrice.safeLowWait,
        },
    ]
}
