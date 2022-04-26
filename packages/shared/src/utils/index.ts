import {
    CurrencyType,
    FungibleAsset,
    FungibleToken,
    leftShift,
    multipliedBy,
    NonFungibleToken,
    TokenType,
} from '@masknet/web3-shared-base'

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
        id: address,
        chainId,
        type: TokenType.Fungible,
        schema,
        address,
        name,
        symbol,
        decimals,
        logoURL,
    }
}

export function createFungibleAsset<ChainId, SchemaType>(
    token: FungibleToken<ChainId, SchemaType>,
    balance: string,
    price?: { [key in CurrencyType]?: string },
): FungibleAsset<ChainId, SchemaType> {
    return {
        ...token,
        balance: leftShift(balance, token.decimals ?? 0).toFixed(),
        price,
        value: {
            [CurrencyType.USD]: multipliedBy(price?.usd ?? 0, leftShift(balance, token.decimals ?? 0)).toFixed(),
        },
    }
}

export function createNonFungileToken<ChainId, SchemaType>(
    chainId: ChainId,
    schema: SchemaType,
    address: string,
    tokenId: string,
    contract: NonFungibleToken<ChainId, SchemaType>['contract'],
    metadata: NonFungibleToken<ChainId, SchemaType>['metadata'],
    collection?: NonFungibleToken<ChainId, SchemaType>['collection'],
): NonFungibleToken<ChainId, SchemaType> {
    return {
        id: address,
        type: TokenType.NonFungible,
        schema,
        chainId,
        tokenId,
        address,
        contract,
        metadata,
        collection,
    }
}
