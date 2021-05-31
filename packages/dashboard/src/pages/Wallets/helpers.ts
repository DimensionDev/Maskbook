import type { Asset } from './types'
import { CurrencyType } from '@dimensiondev/web3-shared'

export const getTokenUSDValue = (token: Asset) => (token.value ? Number.parseFloat(token.value[CurrencyType.USD]) : 0)
