import type { GasOption } from '@masknet/web3-shared'

interface EIP1559ConfirmOptions {
    gasLimit: string
    gasPrice?: string
    maxFee?: string
}

export interface GasSettingProps {
    gasLimit?: string
    onGasLimitChange?: (newVal: string) => void
    gasOption?: GasOption
    onGasOptionChange?: (newOption: GasOption) => void
    onConfirm?: (options: EIP1559ConfirmOptions) => void
}
