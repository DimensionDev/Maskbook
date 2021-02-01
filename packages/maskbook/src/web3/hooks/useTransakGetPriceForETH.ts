import { useAsync } from 'react-use'
import { currentGasPriceEthToUSD } from '../../settings/settings'
import { getTransakGetPriceForETH } from '../apis/getTransakGetPriceForETH'

const timeout = 300
let getTransakGetPriceForETH_Time = 0

export function useTransakGetPriceForETH() {
    return useAsync(async () => {
        const now = Date.now()
        if (getTransakGetPriceForETH_Time === 0 || now - getTransakGetPriceForETH_Time > timeout * 1000) {
            const usd = await getTransakGetPriceForETH()
            getTransakGetPriceForETH_Time = now
            currentGasPriceEthToUSD.value = usd.toFixed(2)
        }
        return currentGasPriceEthToUSD.value
    }, [])
}
