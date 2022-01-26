import type { ChainId, GasOptionConfig } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import { formatGweiToWei, isEIP1559Supported } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { WalletRPC } from '../../../../Wallet/messages'
import { useState } from 'react'

export function useGasConfig(chainId: ChainId) {
    const [gasConfig, setGasConfig] = useState<GasOptionConfig | undefined>()
    const { value: gasPrice } = useAsync(async () => {
        try {
            if (gasConfig) {
                return new BigNumber(
                    (isEIP1559Supported(chainId) ? gasConfig.maxFeePerGas : gasConfig.gasPrice) ?? 0,
                ).toString()
            } else {
                if (isEIP1559Supported(chainId)) {
                    const response = await WalletRPC.getEstimateGasFees(chainId)
                    const maxFeePerGas = formatGweiToWei(response?.medium?.suggestedMaxFeePerGas ?? 0).toFixed()
                    const maxPriorityFeePerGas = formatGweiToWei(
                        response?.medium?.suggestedMaxPriorityFeePerGas ?? 0,
                    ).toFixed()
                    setGasConfig({
                        maxFeePerGas,
                        maxPriorityFeePerGas,
                    })

                    return maxFeePerGas
                } else {
                    const response = await WalletRPC.getGasPriceDictFromDeBank(chainId)
                    const gasPrice = new BigNumber(response?.data.normal.price ?? 0).toString()
                    setGasConfig({
                        gasPrice,
                    })

                    return gasPrice
                }
            }
        } catch {
            return '0'
        }
    }, [chainId, gasConfig])

    return { gasPrice, gasConfig, setGasConfig }
}
