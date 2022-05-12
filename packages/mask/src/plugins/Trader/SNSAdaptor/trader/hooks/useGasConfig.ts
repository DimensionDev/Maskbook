import { useState } from 'react'
import { useAsync } from 'react-use'
import BigNumber from 'bignumber.js'
import type { ChainId, GasOptionConfig } from '@masknet/web3-shared-evm'
import { formatGweiToWei, isEIP1559Supported } from '@masknet/web3-shared-evm'
import { WalletRPC } from '../../../../Wallet/messages'

function formatGas(val?: BigNumber.Value) {
    return typeof val !== 'undefined' ? formatGweiToWei(val).toFixed(0) : undefined
}

export function useGasConfig(chainId: ChainId) {
    const [gasConfig, setGasConfig] = useState<GasOptionConfig | undefined>()
    const { value: gasPrice } = useAsync(async () => {
        try {
            if (isEIP1559Supported(chainId)) {
                const response = await WalletRPC.getEstimateGasFees(chainId)
                const maxFeePerGas = formatGas(response?.medium?.suggestedMaxFeePerGas)
                const maxPriorityFeePerGas = formatGas(response?.medium?.suggestedMaxPriorityFeePerGas)
                setGasConfig({
                    maxFeePerGas,
                    maxPriorityFeePerGas,
                })

                return maxFeePerGas
            } else {
                const response = await WalletRPC.getGasPriceDictFromDeBank(chainId)
                const gasPrice = response?.data.normal.price
                    ? new BigNumber(response.data.normal.price).toString()
                    : undefined
                setGasConfig({
                    gasPrice,
                })

                return gasPrice
            }
        } catch (err) {
            setGasConfig(undefined)
            return
        }
    }, [chainId])

    return { gasPrice, gasConfig, setGasConfig }
}
