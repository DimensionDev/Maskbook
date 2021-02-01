import BigNumber from 'bignumber.js'
import { useAsync } from 'react-use'
import { currentSelectedGasPriceServerSettings } from '../../plugins/Wallet/settings'
import { currentGasPriceSettings } from '../../settings/settings'
import { getGasPrices } from '../apis'
import { useChainId } from './useChainState'
import { useState } from 'react'

export function useGasPrice() {
    const chainId = useChainId()
    const [gasPrice, setGasPrice] = useState(currentGasPriceSettings.value)
    useAsync(async () => {
        if (!new BigNumber(gasPrice || '0').isZero()) {
            return gasPrice
        }
        const gasPrices = await getGasPrices(currentSelectedGasPriceServerSettings.value, chainId)
        gasPrices
            .filter((x) => x.title === 'Standard')
            .map((x) => {
                setGasPrice(new BigNumber(x.gasPrice).multipliedBy(1e9).toFixed())
            })
        return
    }, [chainId, currentSelectedGasPriceServerSettings.value])

    return gasPrice
}
