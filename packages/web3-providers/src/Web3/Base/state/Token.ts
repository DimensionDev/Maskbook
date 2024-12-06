import {
    type FungibleToken,
    type NonFungibleToken,
    type TokenState as Web3TokenState,
    type NonFungibleTokenContract,
} from '@masknet/web3-shared-base'

export interface TokenStorage<ChainId extends number, SchemaType> {}

export abstract class TokenState<ChainId extends number, SchemaType> implements Web3TokenState<ChainId, SchemaType> {}
