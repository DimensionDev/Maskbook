import type { GasOptionType } from '@masknet/web3-shared-base'

interface EIP1559ConfirmOptions {
    gasLimit: number
    gasPrice?: string
    maxFee?: string
    priorityFee?: string
    gasOption?: GasOptionType
}

export interface GasSettingProps {
    gasLimit?: number
    minGasLimit?: number
    onGasLimitChange?: (newGasLimit: number) => void
    gasOptionType?: GasOptionType
    onGasOptionChange?: (newOption: GasOptionType) => void
    onConfirm?: (options: EIP1559ConfirmOptions) => void
}
