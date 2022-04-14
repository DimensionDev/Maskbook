import type { WalletTokenRecord } from './type'
import { createNativeToken, getChainIdFromName } from '@masknet/web3-shared-evm'
import { CurrencyType, TokenType, Web3Plugin } from '@masknet/plugin-infra/web3'
import { multipliedBy, rightShift, toFixed } from '@masknet/web3-shared-base'
import DeBank from '@masknet/web3-constants/evm/debank.json'

type Asset = Web3Plugin.Asset<Web3Plugin.FungibleToken>

export function formatAssets(data: WalletTokenRecord[]): Asset[] {
    const supportedChains = Object.values(DeBank.CHAIN_ID).filter(Boolean)

    const result: Asset[] = data.reduce((list: Asset[], y) => {
        if (!y.is_verified) return list
        const chainIdFromChain = getChainIdFromName(y.chain)
        if (!chainIdFromChain) return list
        const address = supportedChains.includes(y.id) ? createNativeToken(chainIdFromChain).address : y.id

        return [
            ...list,
            {
                id: address,
                chainId: chainIdFromChain,
                token: {
                    id: address,
                    address: address,
                    chainId: chainIdFromChain,
                    type: TokenType.Fungible,
                    decimals: y.decimals,
                    name: y.name,
                    symbol: y.symbol,
                    logoURI: y.logo_url,
                },
                balance: rightShift(y.amount, y.decimals).toFixed(),
                price: {
                    [CurrencyType.USD]: toFixed(y.price),
                },
                value: {
                    [CurrencyType.USD]: multipliedBy(y.price ?? 0, y.amount).toFixed(),
                },
                logoURI: y.logo_url,
            },
        ]
    }, [])
    return result
}
