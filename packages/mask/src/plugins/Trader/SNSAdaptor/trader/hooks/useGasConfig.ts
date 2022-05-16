import { useState } from 'react'
import { useAsync } from 'react-use'
import BigNumber from 'bignumber.js'
import { ChainId, chainResolver, GasOptionConfig , formatGweiToWei } from '@masknet/web3-shared-evm'
import { WalletRPC } from '../../../../Wallet/messages'

export function useGasConfig(chainId: ChainId) {
    const [gasConfig, setGasConfig] = useState<GasOptionConfig | undefined>()
    const { value: gasPrice } = useAsync(async () => {
        try {
<<<<<<< HEAD
            if (gasConfig) {
                return new BigNumber(
                    (chainResolver.isSupport(chainId, 'EIP1559') ? gasConfig.maxFeePerGas : gasConfig.gasPrice) ?? 0,
                ).toString()
            } else {
                if (chainResolver.isSupport(chainId, 'EIP1559')) {
                    const response = await WalletRPC.getEstimateGasFees(chainId)
                    const maxFeePerGas = formatGweiToWei(response?.medium?.suggestedMaxFeePerGas ?? 0).toFixed(0)
                    const maxPriorityFeePerGas = formatGweiToWei(
                        response?.medium?.suggestedMaxPriorityFeePerGas ?? 0,
                    ).toFixed(0)
                    setGasConfig({
                        maxFeePerGas,
                        maxPriorityFeePerGas,
                    })
=======
            if (isEIP1559Supported(chainId)) {
                const response = await WalletRPC.getEstimateGasFees(chainId)
                const maxFeePerGas = formatGweiToWei(response?.medium?.suggestedMaxFeePerGas ?? 0).toFixed(0)
                const maxPriorityFeePerGas = formatGweiToWei(
                    response?.medium?.suggestedMaxPriorityFeePerGas ?? 0,
                ).toFixed(0)
                setGasConfig({
                    maxFeePerGas,
                    maxPriorityFeePerGas,
                })
>>>>>>> develop

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
