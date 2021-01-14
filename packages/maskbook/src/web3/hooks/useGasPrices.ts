import { useAsyncRetry } from 'react-use'
import { currentSelectedGasPriceServerSettings } from '../../plugins/Wallet/settings'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getGasPrices } from '../apis'
import { useChainId } from './useChainState'

export function useGasPrices() {
    const chainId = useChainId()
    const selectedGasPriceServer = useValueRef(currentSelectedGasPriceServerSettings)
    return useAsyncRetry(async () => {
        const gasPrices = await getGasPrices(selectedGasPriceServer, chainId)
        // custom gas price
        gasPrices.push({
            title: 'Custom',
            wait: 5,
            gasPrice: '0',
        })
        return gasPrices
    }, [chainId, selectedGasPriceServer])
}
