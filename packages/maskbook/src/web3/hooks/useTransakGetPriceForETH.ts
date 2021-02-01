import { useState } from 'react'
import { useAsync } from 'react-use'
import { currentGasPriceEthToUSD } from '../../settings/settings'
import { getTransakGetPriceForETH } from '../apis/getTransakGetPriceForETH'

const timeout = 300
let getTransakGetPriceForETH_Time = 0

export function useTransakGetPriceForETH() {
    console.log('time: ', getTransakGetPriceForETH_Time)
    return useAsync(async () => {
        console.log('time: ', getTransakGetPriceForETH_Time)
        const now = Date.now()
        if (getTransakGetPriceForETH_Time === 0 || now - getTransakGetPriceForETH_Time > timeout * 1000) {
            const usd = await getTransakGetPriceForETH()
            getTransakGetPriceForETH_Time = now
            currentGasPriceEthToUSD.value = usd.toFixed(2)
            console.log('usd:', usd)
        }
        console.log('use1:', currentGasPriceEthToUSD.value)
        return currentGasPriceEthToUSD.value
    }, [])
}
