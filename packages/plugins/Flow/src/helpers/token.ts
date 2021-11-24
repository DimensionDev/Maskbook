import { CurrencyType, TokenType, Web3Plugin } from '@masknet/plugin-infra'
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
    value?: { [key in CurrencyType]?: string },
    logoURI?: string,
): Web3Plugin.Asset {
    return {
        id: token.address,
        chainId: token.chainId,
        balance,
        token,
        logoURI,
        value,
    }
}
