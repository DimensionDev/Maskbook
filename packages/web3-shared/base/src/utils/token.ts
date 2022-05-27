import {
    FungibleToken,
    NonFungibleToken,
    NonFungibleTokenCollection,
    NonFungibleTokenContract,
    NonFungibleTokenMetadata,
    TokenType,
} from '../specs'
import type { Constants } from './types'
import { chain } from 'lodash-unified'

export function createFungibleToken<ChainId, SchemaType>(
    chainId: ChainId,
    schema: SchemaType,
    address: string,
    name: string,
    symbol: string,
    decimals: number,
    logoURL?: string,
): FungibleToken<ChainId, SchemaType> {
    return {
        chainId,
        type: TokenType.Fungible,
        schema,
        id: address,
        address,
        name,
        symbol,
        decimals,
        logoURL,
    }
}
export function createNonFungibelTokenMetadata<ChainId>(
    chainId: ChainId,
    name: string,
    symbol: string,
    description?: string,
    mediaType?: string,
    mediaURL?: string,
    imageURL?: string,
): NonFungibleTokenMetadata<ChainId> {
    return {
        chainId,
        name,
        symbol,
        description,
        mediaURL,
        mediaType,
        imageURL,
    }
}
export function createNonFungibleTokenContract<ChainId, SchemaType>(
    chainId: ChainId,
    schema: SchemaType,
    address: string,
    name: string,
    symbol: string,
    balance?: number,
): NonFungibleTokenContract<ChainId, SchemaType> {
    return {
        chainId,
        name,
        symbol,
        address,
        schema,
        balance,
    }
}
export function createNonFungibleTokenCollection<ChainId>(
    chainId: ChainId,
    name: string,
    slug: string,
    description?: string,
    iconURL?: string,
    verified?: boolean,
    createdAt?: number,
): NonFungibleTokenCollection<ChainId> {
    return {
        chainId,
        name,
        slug,
        description,
        iconURL,
        verified,
        createdAt,
    }
}
export function createNonFungibleToken<ChainId, SchemaType>(
    chainId: ChainId,
    schema: SchemaType,
    address: string,
    tokenId: string,
    metadata?: NonFungibleToken<ChainId, SchemaType>['metadata'],
    contract?: NonFungibleToken<ChainId, SchemaType>['contract'],
    collection?: NonFungibleToken<ChainId, SchemaType>['collection'],
): NonFungibleToken<ChainId, SchemaType> {
    return {
        chainId,
        id: address,
        type: TokenType.NonFungible,
        schema,
        address,
        tokenId,
        metadata,
        contract,
        collection,
    }
}

export function createFungibleTokensFromConstants<T extends Constants<string>, ChainId extends number, SchemaType>(
    chainIds: Array<{ key: string; value: ChainId }>,
    schema: SchemaType,
    constants: T,
) {
    return (
        key: keyof T,
        name: string | ((chainId: ChainId) => string),
        symbol: string | ((chainId: ChainId) => string),
        decimals: number | ((chainId: ChainId) => number),
    ) => {
        return chain(chainIds)
            .keyBy('value')
            .mapValues<FungibleToken<ChainId, SchemaType>>(({ key: chainName, value: chainId }) => {
                const evaluator = <R>(f: ((chainId: ChainId) => R) | R): R =>
                    // @ts-ignore
                    typeof f === 'function' ? f(chainId as ChainId) : f

                return createFungibleToken<ChainId, SchemaType>(
                    chainId,
                    schema,
                    constants[key][chainName as 'Mainnet'] ?? '',
                    evaluator(name),
                    evaluator(symbol),
                    evaluator(decimals),
                )
            })
            .value()
    }
}
