import type { WalletTokenRecord } from './type'
import { createNativeToken, getChainIdFromName } from '@masknet/web3-shared-evm'
import { CurrencyType, TokenType, Web3Plugin } from '@masknet/plugin-infra/web3'
import { multipliedBy, rightShift, toFixed } from '@masknet/web3-shared-base'
import DeBank from '@masknet/web3-constants/evm/debank.json'

type Asset = Web3Plugin.Asset<Web3Plugin.FungibleToken>

export function formatAssets(records: WalletTokenRecord[]): Asset[] {
    const supportedChains = Object.values(DeBank.CHAIN_ID).filter(Boolean)
    return records.flatMap((asset) => {
        if (!asset.is_verified) return []
        const chainIdFromChain = getChainIdFromName(asset.chain)
        if (!chainIdFromChain) return []
        const address = supportedChains.includes(asset.id) ? createNativeToken(chainIdFromChain).address : asset.id
        return {
            id: address,
            chainId: chainIdFromChain,
            token: {
                id: address,
                address,
                chainId: chainIdFromChain,
                type: TokenType.Fungible,
                decimals: asset.decimals,
                name: asset.name,
                symbol: asset.symbol,
                logoURI: asset.logo_url,
            },
            balance: rightShift(asset.amount, asset.decimals).toFixed(),
            price: {
                [CurrencyType.USD]: toFixed(asset.price),
            },
            value: {
                [CurrencyType.USD]: multipliedBy(asset.price ?? 0, asset.amount).toFixed(),
            },
            logoURI: asset.logo_url,
        }
    })
}
