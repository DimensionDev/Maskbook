import { keyBy, mapValues } from 'lodash-es'
import {
    type FungibleToken,
    type NonFungibleToken,
    type NonFungibleCollection,
    type NonFungibleTokenContract,
    type NonFungibleTokenMetadata,
    TokenType,
} from '../specs/index.js'
import type { Constants } from './types.js'

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
export function createNonFungibleTokenMetadata<ChainId>(
    chainId: ChainId,
    name: string,
    tokenId: string,
    symbol: string,
    description?: string,
    mediaType?: string,
    mediaURL?: string,
    imageURL?: string,
): NonFungibleTokenMetadata<ChainId> {
    return {
        chainId,
        name,
        tokenId,
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
): NonFungibleTokenContract<ChainId, SchemaType> {
    return {
        chainId,
        schema,
        name,
        symbol,
        address,
    }
}
export function createNonFungibleTokenCollection<ChainId, SchemaType>(
    chainId: ChainId,
    address: string,
    name: string,
    slug: string,
    description?: string,
    iconURL?: string,
    verified?: boolean,
    createdAt?: number,
): NonFungibleCollection<ChainId, SchemaType> {
    return {
        id: address,
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
    address: string,
    schema: SchemaType,
    tokenId: string,
    ownerId?: string,
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
        ownerId,
        metadata,
        contract,
        collection,
    }
}

export function createFungibleTokensFromConstants<T extends Constants<string>, ChainId extends number, SchemaType>(
    chainIds: Array<{
        key: string
        value: ChainId
    }>,
    schema: SchemaType,
    constants: T,
) {
    return (
        key: keyof T,
        name: string | ((chainId: ChainId) => string),
        symbol: string | ((chainId: ChainId) => string),
        decimals: number | ((chainId: ChainId) => number),
    ) => {
        const chainIdGroup = keyBy(chainIds, 'value')
        return mapValues(chainIdGroup, ({ key: chainName, value: chainId }) => {
            function evaluator<R extends string | number>(f: ((chainId: ChainId) => R) | R): R {
                return typeof f === 'function' ? f(chainId) : f
            }

            return createFungibleToken<ChainId, SchemaType>(
                chainId,
                schema,
                constants[key][chainName as 'Mainnet'] ?? '',
                evaluator(name),
                evaluator(symbol),
                evaluator(decimals),
            )
        })
    }
}
