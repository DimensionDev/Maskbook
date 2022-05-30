import { useEffect, useMemo, useState } from 'react'
import { toHex } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { chainResolver, formatGweiToWei } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useChainId, useGasOptions, useGasPrice } from '@masknet/plugin-infra/web3'
import { GasOptionType, NetworkPluginID } from '@masknet/web3-shared-base'

export const useGasConfig = (gasLimit: number, minGasLimit: number) => {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)

    const [gasLimit_, setGasLimit_] = useState(0)
    const [customGasPrice, setCustomGasPrice] = useState<BigNumber.Value>(0)
    const [gasOption, setGasOption] = useState<GasOptionType>(GasOptionType.NORMAL)
    const [maxFee, setMaxFee] = useState<BigNumber.Value>(0)
    const [priorityFee, setPriorityFee] = useState<BigNumber.Value>(0)

    const is1559Supported = useMemo(() => chainResolver.isSupport(chainId, 'EIP1559'), [chainId])
    const { value: defaultGasPrice = '0' } = useGasPrice(NetworkPluginID.PLUGIN_EVM)
    const gasPrice = customGasPrice || defaultGasPrice
    const { value: gasOptions } = useGasOptions(NetworkPluginID.PLUGIN_EVM)

    const { setDialog: setGasSettingDialog, closeDialog } = useRemoteControlledDialog(
        WalletMessages.events.gasSettingDialogUpdated,
    )

    useEffect(() => closeDialog, [closeDialog])

    useEffect(() => {
        setGasLimit_(gasLimit)
    }, [gasLimit])

    useEffect(() => {
        return WalletMessages.events.gasSettingDialogUpdated.on((evt) => {
            if (evt.open) return
            if (evt.gasPrice) setCustomGasPrice(evt.gasPrice)
            if (evt.gasOption) setGasOption(evt.gasOption)
            if (evt.gasLimit) setGasLimit_(evt.gasLimit)
            if (evt.maxFee) setMaxFee(evt.maxFee)
        })
    }, [])

    useEffect(() => {
        if (!gasOptions) return

        if (is1559Supported) {
            const gasLevel = gasOptions.normal
            setMaxFee((oldVal) => {
                return !oldVal ? formatGweiToWei(gasLevel?.suggestedMaxFeePerGas ?? '0') : oldVal
            })
            setPriorityFee((oldVal) => {
                return !oldVal ? formatGweiToWei(gasLevel?.suggestedMaxPriorityFeePerGas ?? '0') : oldVal
            })
        } else {
            setCustomGasPrice((oldVal) => (!oldVal ? gasOptions.normal.suggestedMaxFeePerGas : oldVal))
        }
    }, [is1559Supported, gasOptions?.normal])

    useEffect(() => {
        if (!gasOptions) return
        if (is1559Supported) {
            const gasLevel = gasOptions.normal
            setMaxFee(formatGweiToWei(gasLevel?.suggestedMaxFeePerGas ?? 0))
            setPriorityFee(formatGweiToWei(gasLevel?.suggestedMaxPriorityFeePerGas ?? 0))
        } else {
            setCustomGasPrice(gasOptions.normal.suggestedMaxFeePerGas)
        }
    }, [chainId, gasOptions?.normal])

    const gasConfig = useMemo(() => {
        return is1559Supported
            ? {
                  gas: gasLimit_,
                  maxFeePerGas: toHex(new BigNumber(maxFee).integerValue().toFixed()),
                  maxPriorityFeePerGas: toHex(new BigNumber(priorityFee).integerValue().toFixed()),
              }
            : { gas: gasLimit_, gasPrice: new BigNumber(gasPrice).toNumber() }
    }, [is1559Supported, gasLimit_, maxFee, priorityFee, gasPrice, chainId])

    return {
        gasConfig,
        gasLimit: gasLimit_,
        maxFee,
        onCustomGasSetting: () => setGasSettingDialog({ open: true, gasLimit: gasLimit_, gasOption, minGasLimit }),
    }
}
