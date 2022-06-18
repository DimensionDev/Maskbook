import {
    FungibleToken,
    CurrencyType,
    TokenType,
    leftShift,
    multipliedBy,
    FungibleAsset,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-solana'

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
        balance,
        price,
        value: {
            [CurrencyType.USD]: multipliedBy(price?.usd ?? 0, leftShift(balance, token.decimals)).toFixed(),
        },
    }
}
