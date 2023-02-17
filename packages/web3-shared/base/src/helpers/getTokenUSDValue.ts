import { CurrencyType } from '@masknet/web3-shared-base'

export function getTokenUSDValue(value?: {
    [key in CurrencyType]?: string
}) {
    return value ? Number.parseFloat(value[CurrencyType.USD] ?? '') : 0
}
