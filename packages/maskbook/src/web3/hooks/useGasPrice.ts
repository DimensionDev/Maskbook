import { useAsyncRetry } from 'react-use'
import { currentSelectedGasPriceServerSettings } from '../../plugins/Wallet/settings'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getGasPrices } from '../apis'

export function useGasPrice() {
    const selectedGasPriceServer = useValueRef(currentSelectedGasPriceServerSettings)

    return useAsyncRetry(async () => {
        const gasPrices = await getGasPrices(selectedGasPriceServer)
        return gasPrices.reverse()
    }, [])
}
