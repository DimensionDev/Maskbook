import type { ChainId, SchemaType } from '@masknet/web3-shared-solana'
import type { NonFungibleTokenAPI } from '../../types'

export class NFTScanSolanaAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {}
