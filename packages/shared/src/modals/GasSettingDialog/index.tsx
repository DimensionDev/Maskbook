import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { forwardRef, useState } from 'react'
import { useSingletonModal } from '../../index.js'
import { GasOptionType } from '@masknet/web3-shared-base'
import { GasSetting } from './GasSettingModal.js'
import { type BigNumber } from 'bignumber.js'

export type GasSettingDialogOpenOrCloseProps = {
    gasOption?: GasOptionType
    gasLimit?: number
    minGasLimit?: number
    gasPrice?: BigNumber.Value
    maxFee?: BigNumber.Value
    priorityFee?: BigNumber.Value
} | void

export interface GasSettingDialogProps {}

export const GasSettingModal = forwardRef<
    SingletonModalRefCreator<GasSettingDialogOpenOrCloseProps, GasSettingDialogOpenOrCloseProps>,
    GasSettingDialogProps
>((props, ref) => {
    const [gasOptionType, setGasOptionType] = useState<GasOptionType>(GasOptionType.NORMAL)
    const [gasLimit, setGasLimit] = useState(0)
    const [minGasLimit, setMinGasLimit] = useState(0)
    const [gasPrice, setGasPrice] = useState<BigNumber.Value>(0)
    const [maxFee, setMaxFee] = useState<BigNumber.Value>(0)
    const [priorityFee, setPriorityFee] = useState<BigNumber.Value>(0)

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(props) {
            setGasOptionType(props?.gasOption ?? GasOptionType.NORMAL)
            setGasLimit(props?.gasLimit ?? 0)
            setMinGasLimit(props?.minGasLimit ?? 0)
            setGasPrice(props?.gasPrice ?? 0)
            setMaxFee(props?.maxFee ?? 0)
            setPriorityFee(props?.priorityFee ?? 0)
        },
        onClose(props) {
            setGasOptionType(props?.gasOption ?? GasOptionType.NORMAL)
            setGasLimit(props?.gasLimit ?? 0)
            setMinGasLimit(props?.minGasLimit ?? 0)
            setGasPrice(props?.gasPrice ?? 0)
            setMaxFee(props?.maxFee ?? 0)
            setPriorityFee(props?.priorityFee ?? 0)
        },
    })

    if (!open) return null
    return (
        <GasSetting
            open
            onClose={() => dispatch?.close()}
            gasOption={gasOptionType}
            setGasLimit={setGasLimit}
            gasLimit={gasLimit}
            minGasLimit={minGasLimit}
            setGasOptionType={setGasOptionType}
            gasPrice={gasPrice}
            maxFee={maxFee}
            priorityFee={priorityFee}
        />
    )
})
