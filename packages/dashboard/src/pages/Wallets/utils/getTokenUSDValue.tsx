import { CurrencyType } from '@masknet/plugin-infra/web3'

export const getTokenUSDValue = (value?: { [key in CurrencyType]?: string }) =>
    value ? Number.parseFloat(value[CurrencyType.USD] ?? '') : 0
