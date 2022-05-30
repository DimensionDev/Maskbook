import {
    CurrencyType,
    TokenType,
    FungibleAsset,
    FungibleToken,
    leftShift,
    multipliedBy,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-flow'

export function createFungibleToken(
    chainId: ChainId,
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
        schema: SchemaType.Fungible,
        address,
        name,
        symbol,
        decimals,
        logoURL,
    }
}

export function createFungibleAsset(
    token: FungibleToken<ChainId, SchemaType>,
    balance: string,
    price?: { [key in CurrencyType]?: string },
): FungibleAsset<ChainId, SchemaType> {
    return {
        ...token,
        balance: leftShift(balance, 8).toFixed(),
        price,
        value: {
            [CurrencyType.USD]: multipliedBy(price?.usd ?? 0, leftShift(balance, 8)).toFixed(),
        },
    }
}
