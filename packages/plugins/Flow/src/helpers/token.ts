import { CurrencyType, TokenType, Web3Plugin } from '@masknet/plugin-infra'
import type { ChainId } from '@masknet/web3-shared-flow'
import BigNumber from 'bignumber.js'

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
        balance: new BigNumber(balance).dividedBy(new BigNumber(10).pow(8)).toFixed(),
        token,
        logoURI,
        value: {
            [CurrencyType.USD]: new BigNumber(price?.usd ?? 0)
                .multipliedBy(new BigNumber(balance).dividedBy(new BigNumber(10).pow(8)))
                .toFixed(),
        },
        price,
    }
}
