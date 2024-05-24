import { useState } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID, type SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { SelectGasSettingsDialog, type SelectGasSettings } from './SelectGasSettingsDialog.js'

export interface SelectGasSettingsModalOpenProps {
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    slippageTolerance?: number
    transaction?: Web3Helper.TransactionAll
    title?: string
    disableGasPrice?: boolean
    disableSlippageTolerance?: boolean
    disableGasLimit?: boolean
}
export interface SelectGasSettingsModalCloseProps {
    settings?: SelectGasSettings | null
}

export function SelectGasSettingsModal({
    ref,
}: SingletonModalProps<SelectGasSettingsModalOpenProps, SelectGasSettingsModalCloseProps>) {
    const [pluginID, setPluginID] = useState<NetworkPluginID>()
    const [chainId, setChainId] = useState<Web3Helper.ChainIdAll>()
    const [slippageTolerance, setSlippageTolerance] = useState<number>()
    const [transaction, setTransaction] = useState<Web3Helper.TransactionAll>()
    const [title, setTitle] = useState<string>()
    const [disableGasPrice, setDisableGasPrice] = useState<boolean>()
    const [disableSlippageTolerance, setDisableSlippageTolerance] = useState<boolean>()
    const [disableGasLimit, setDisableGasLimit] = useState<boolean>()

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setPluginID(props.pluginID ?? NetworkPluginID.PLUGIN_EVM)
            setChainId(props.chainId)
            setSlippageTolerance(props.slippageTolerance)
            setTransaction(props.transaction)
            setTitle(props.title)
            setDisableGasPrice(props.disableGasPrice)
            setDisableSlippageTolerance(props.disableSlippageTolerance)
            setDisableGasLimit(props.disableGasLimit)
        },
    })

    if (!open) return null
    return (
        <SelectGasSettingsDialog
            open
            onClose={(settings) => dispatch?.close({ settings })}
            pluginID={pluginID}
            chainId={chainId}
            slippageTolerance={slippageTolerance}
            transaction={transaction}
            title={title}
            disableGasPrice={disableGasPrice}
            disableSlippageTolerance={disableSlippageTolerance}
            disableGasLimit={disableGasLimit}
        />
    )
}
