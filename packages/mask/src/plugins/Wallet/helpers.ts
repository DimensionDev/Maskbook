import { CurrencyType, FungibleAsset } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

export const getTokenUSDValue = (token: FungibleAsset<ChainId, SchemaType>) =>
    token.value ? Number.parseFloat(token.price?.[CurrencyType.USD] ?? '0') : 0
