import type { ChainId, GasOptionConfig } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'
import { formatGweiToWei, getNetworkTypeFromChainId } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { NetworkType } from '@masknet/public-api'
import { WalletRPC } from '../../../../Wallet/messages'
import { useState } from 'react'

export function useGasConfig(chainId: ChainId) {
    const [gasConfig, setGasConfig] = useState<GasOptionConfig | undefined>()
    const { value: gasPrice } = useAsync(async () => {
        try {
            const network = getNetworkTypeFromChainId(chainId)
            if (gasConfig) {
                return new BigNumber(
                    (network === NetworkType.Ethereum ? gasConfig.maxFeePerGas : gasConfig.gasPrice) ?? 0,
                ).toString()
            } else {
                if (network === NetworkType.Ethereum) {
                    const response = await WalletRPC.getEstimateGasFees(chainId)
                    const maxFeePerGas = formatGweiToWei(response?.medium?.suggestedMaxFeePerGas ?? 0).toString()
                    const maxPriorityFeePerGas = formatGweiToWei(
                        response?.medium?.suggestedMaxPriorityFeePerGas ?? 0,
                    ).toString()
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
