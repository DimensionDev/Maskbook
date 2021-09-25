import type { GasOption } from '@masknet/web3-shared'

export interface GasSettingProps {
    gasLimit?: number | string
    onGasLimitChange?: (newVal: number | string) => void
    gasOption?: GasOption
    onGasOptionChange?: (newOption: GasOption) => void
    onConfirm?: (options: { gasPrice: number; gasLimit: number | string }) => void
}
