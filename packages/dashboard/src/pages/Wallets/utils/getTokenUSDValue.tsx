import type { CurrencyType } from '@masknet/web3-shared-base'

export const getTokenUSDValue = (value?: { [key in CurrencyType]?: string }) =>
    value ? Number.parseFloat(value[CurrencyType.USD] ?? '') : 0
