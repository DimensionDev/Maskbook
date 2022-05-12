import type { GasOptionType } from '@masknet/web3-shared-base'

export interface GasSettingProps {
    gasLimit?: number | string
    onGasLimitChange?: (newVal: number | string) => void
    gasOptionType?: GasOptionType
    onGasOptionTypeChange?: (newOptionType: GasOptionType) => void
    onConfirm?: (options: { gasPrice: number; gasLimit: number | string }) => void
}
