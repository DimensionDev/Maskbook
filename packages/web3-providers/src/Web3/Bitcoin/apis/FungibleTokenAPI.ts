import type { ChainId, SchemaType } from '@masknet/web3-shared-bitcoin'
import type { FungibleTokenAPI } from '../../../entry-types.js'

export class BitcoinFungibleTokenAPI implements FungibleTokenAPI.Provider<ChainId, SchemaType> {}
