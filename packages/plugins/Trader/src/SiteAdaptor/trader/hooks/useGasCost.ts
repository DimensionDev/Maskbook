import { NetworkPluginID } from '@masknet/shared-base'
import { useNativeTokenPrice } from '@masknet/web3-hooks-base'
import { multipliedBy } from '@masknet/web3-shared-base'
import { formatWeiToEther } from '@masknet/web3-shared-evm'
import { type BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useTrade } from '../contexts/TradeProvider.js'

export function useGasCost(gasPrice: BigNumber.Value, gas: BigNumber.Value) {
    const { chainId } = useTrade()
    const gasFee = useMemo(() => multipliedBy(gas, gasPrice ?? '1'), [gasPrice, gas])
    const { data: price } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const gasCost = useMemo(() => {
        if (!price) return ''
        return multipliedBy(formatWeiToEther(gasFee), price ?? 0).toFixed(2)
    }, [gas, price])
    return { gasFee, gasCost }
}
