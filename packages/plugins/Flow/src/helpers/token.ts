import { CurrencyType, TokenType, Web3Plugin } from '@masknet/plugin-infra/web3'
import { leftShift, multipliedBy } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-flow'

export function createFungibleToken(
    chainId: ChainId,
    address: string,
    name: string,
    symbol: string,
    decimals: number,
    logoURI?: string,
): Web3Plugin.FungibleToken<ChainId, SchemaType> {
    return {
        id: address,
        chainId,
        type: TokenType.Fungible,
        schema: SchemaType.Fungible,
        address,
        name,
        symbol,
        decimals,
        logoURI,
    }
}

export function createFungibleAsset(
    token: Web3Plugin.FungibleToken<ChainId, SchemaType>,
    balance: string,
    price?: { [key in CurrencyType]?: string },
): Web3Plugin.FungibleAsset<ChainId, SchemaType> {
    return {
        ...token,
        balance: leftShift(balance, 8).toFixed(),
        price,
        value: {
            [CurrencyType.USD]: multipliedBy(price?.usd ?? 0, leftShift(balance, 8)).toFixed(),
        },
    }
}
