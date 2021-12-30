import type { GasOption } from '@masknet/web3-shared-evm'

interface EIP1559ConfirmOptions {
    gasLimit: number
    gasPrice?: string
    maxFee?: string
    priorityFee?: string
    gasOption: GasOption | null
}

export interface GasSettingProps {
    gasLimit?: number
    minGasLimit?: number
    onGasLimitChange?: (newGasLimit: number) => void
    gasOption?: GasOption
    onGasOptionChange?: (newOption: GasOption) => void
    onConfirm?: (options: EIP1559ConfirmOptions) => void
}
