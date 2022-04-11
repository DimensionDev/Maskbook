import { useEffect, useMemo, useState } from 'react'
import { toHex } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { formatGweiToWei, GasOption, isEIP1559Supported, useChainId, useGasPrice } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useGasOptions } from '../../../hooks/useGasOptions'

export const useGasConfig = (gasLimit: number, minGasLimit: number) => {
    const chainId = useChainId()

    const [gasLimit_, setGasLimit_] = useState(0)
    const [customGasPrice, setCustomGasPrice] = useState<BigNumber.Value>(0)
    const [gasOption, setGasOption] = useState<GasOption>(GasOption.Medium)
    const [maxFee, setMaxFee] = useState<BigNumber.Value>(0)
    const [priorityFee, setPriorityFee] = useState<BigNumber.Value>(0)

    const is1559Supported = useMemo(() => isEIP1559Supported(chainId), [chainId])
    const { value: defaultGasPrice = '0' } = useGasPrice()
    const gasPrice = customGasPrice || defaultGasPrice
    const { gasOptions } = useGasOptions()

    const { setDialog: setGasSettingDialog, closeDialog } = useRemoteControlledDialog(
        WalletMessages.events.gasSettingDialogUpdated,
    )

    useEffect(() => closeDialog, [closeDialog])

    useEffect(() => {
        setGasLimit_(gasLimit)
    }, [gasLimit])

    useEffect(
        () =>
            WalletMessages.events.gasSettingDialogUpdated.on((evt) => {
                if (evt.open) return
                if (evt.gasPrice) setCustomGasPrice(evt.gasPrice)
                if (evt.gasOption) setGasOption(evt.gasOption)
                if (evt.gasLimit) setGasLimit_(evt.gasLimit)
                if (evt.maxFee) setMaxFee(evt.maxFee)
            }),
        [],
    )

    useEffect(() => {
        if (!gasOptions) return

        if (is1559Supported) {
            const gasLevel = gasOptions.medium as Exclude<typeof gasOptions.medium, number>
            setMaxFee((oldVal) => (!oldVal ? formatGweiToWei(gasLevel?.suggestedMaxFeePerGas ?? 0) : oldVal))
            setPriorityFee((oldVal) =>
                !oldVal ? formatGweiToWei(gasLevel?.suggestedMaxPriorityFeePerGas ?? 0) : oldVal,
            )
        } else {
            setCustomGasPrice((oldVal) => (!oldVal ? (gasOptions.medium as number) : oldVal))
        }
    }, [is1559Supported, gasOptions?.medium])

    useEffect(() => {
        if (!gasOptions) return

        if (is1559Supported) {
            const gasLevel = gasOptions.medium as Exclude<typeof gasOptions.medium, number>
            setMaxFee(formatGweiToWei(gasLevel?.suggestedMaxFeePerGas ?? 0))
            setPriorityFee(formatGweiToWei(gasLevel?.suggestedMaxPriorityFeePerGas ?? 0))
        } else {
            setCustomGasPrice(gasOptions.medium as number)
        }
    }, [chainId, gasOptions?.medium])

    const gasConfig = useMemo(
        () =>
            is1559Supported
                ? {
                      gas: gasLimit_,
                      maxFeePerGas: toHex(new BigNumber(maxFee).integerValue().toFixed()),
                      maxPriorityFeePerGas: toHex(new BigNumber(priorityFee).integerValue().toFixed()),
                  }
                : { gas: gasLimit_, gasPrice: new BigNumber(gasPrice).toNumber() },
        [is1559Supported, gasLimit_, maxFee, priorityFee, gasPrice, chainId],
    )

    return {
        gasConfig,
        gasLimit: gasLimit_,
        maxFee,
        onCustomGasSetting: () => setGasSettingDialog({ open: true, gasLimit: gasLimit_, gasOption, minGasLimit }),
    }
}
