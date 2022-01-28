import { CurrencyType, TokenType, Web3Plugin } from '@masknet/plugin-infra'
import { leftShift, multipliedBy } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-flow'

export function createFungibleToken(
    chainId: ChainId,
    address: string,
    name: string,
    symbol: string,
    decimals: number,
): Web3Plugin.FungibleToken {
    return {
        id: address,
        chainId,
        type: TokenType.Fungible,
        address,
        name,
        symbol,
        decimals,
    }
}

export function createFungibleAsset(
    token: Web3Plugin.FungibleToken,
    balance: string,
    logoURI?: string,
    price?: { [key in CurrencyType]?: string },
): Web3Plugin.Asset {
    return {
        id: token.address,
        chainId: token.chainId,
        balance: leftShift(balance, 8).toFixed(),
        token,
        logoURI,
        value: {
            [CurrencyType.USD]: multipliedBy(price?.usd ?? 0, leftShift(balance, 8)).toFixed(),
        },
        price,
    }
}
