import { useEffect, useMemo, useState } from 'react'
import { toHex } from 'web3-utils'
import { BigNumber } from 'bignumber.js'
import { ChainResolver } from '@masknet/web3-providers'
import { type GasConfig } from '@masknet/web3-shared-evm'
import { useChainContext, useGasOptions, useGasPrice } from '@masknet/web3-hooks-base'
import { GasOptionType } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { GasSettingModal } from '@masknet/shared'

interface GasConfigProps {
    gasConfig: GasConfig
    gasLimit: number
    maxFee: BigNumber.Value
    onCustomGasSetting: () => ReturnType<typeof GasSettingModal.openAndWaitForClose>
}

export function useGasConfig(gasLimit: number, minGasLimit: number): GasConfigProps {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const [gasLimit_, setGasLimit_] = useState(0)
    const [customGasPrice, setCustomGasPrice] = useState<BigNumber.Value>(0)
    const [gasOption, setGasOption] = useState<GasOptionType>(GasOptionType.NORMAL)
    const [maxFee, setMaxFee] = useState<BigNumber.Value>(0)
    const [priorityFee, setPriorityFee] = useState<BigNumber.Value>(0)

    const is1559Supported = useMemo(() => ChainResolver.isFeatureSupported(chainId, 'EIP1559'), [chainId])
    const { data: defaultGasPrice = '0' } = useGasPrice(NetworkPluginID.PLUGIN_EVM)
    const gasPrice = customGasPrice || defaultGasPrice
    const { data: gasOptions } = useGasOptions(NetworkPluginID.PLUGIN_EVM)

    useEffect(() => GasSettingModal.close(), [])

    useEffect(() => {
        setGasLimit_(gasLimit)
    }, [gasLimit])

    useEffect(() => {
        if (!gasOptions) return

        if (is1559Supported) {
            const gasLevel = gasOptions.normal
            setMaxFee((oldVal) => {
                return !oldVal ? gasLevel?.suggestedMaxFeePerGas ?? '0' : oldVal
            })
            setPriorityFee((oldVal) => {
                return !oldVal ? gasLevel?.suggestedMaxPriorityFeePerGas ?? '0' : oldVal
            })
        } else {
            setCustomGasPrice((oldVal) => (!oldVal ? gasOptions.normal.suggestedMaxFeePerGas : oldVal))
        }
    }, [is1559Supported, gasOptions?.normal])

    useEffect(() => {
        if (!gasOptions) return
        if (is1559Supported) {
            const gasLevel = gasOptions.normal
            setMaxFee(gasLevel?.suggestedMaxFeePerGas ?? 0)
            setPriorityFee(gasLevel?.suggestedMaxPriorityFeePerGas ?? 0)
        } else {
            setCustomGasPrice(gasOptions.normal.suggestedMaxFeePerGas)
        }
    }, [chainId, gasOptions?.normal])

    const gasConfig: GasConfig = useMemo(() => {
        return is1559Supported
            ? {
                  gas: toHex(gasLimit_),
                  maxFeePerGas: toHex(new BigNumber(maxFee).integerValue().toFixed()),
                  maxPriorityFeePerGas: toHex(new BigNumber(priorityFee).integerValue().toFixed()),
              }
            : { gas: toHex(gasLimit_), gasPrice: toHex(new BigNumber(gasPrice).toString()) }
    }, [is1559Supported, gasLimit_, maxFee, priorityFee, gasPrice, chainId])

    return {
        gasConfig,
        gasLimit: gasLimit_,
        maxFee,
        onCustomGasSetting: async () =>
            GasSettingModal.openAndWaitForClose({ gasLimit: gasLimit_, gasOption, minGasLimit }),
    }
}
