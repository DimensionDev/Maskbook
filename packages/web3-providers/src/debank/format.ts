import type { WalletTokenRecord } from './type'
import { ChainId, createNativeToken, getChainIdFromName } from '@masknet/web3-shared-evm'
import { CurrencyType, TokenType, Web3Plugin } from '@masknet/plugin-infra'
import { multipliedBy, rightShift, toFixed } from '@masknet/web3-shared-base'
import DeBank from '@masknet/web3-constants/evm/debank.json'

type Asset = Web3Plugin.Asset<Web3Plugin.FungibleToken>

export function formatAssets(data: WalletTokenRecord[]): Asset[] {
    const supportedChains = Object.values(DeBank.CHAIN_ID).filter(Boolean)

    return data
        .filter((x) => x.is_verified)
        .map((y): Asset => {
            const chainIdFromChain = getChainIdFromName(y.chain) ?? ChainId.Mainnet
            const address = supportedChains.includes(y.id) ? createNativeToken(chainIdFromChain).address : y.id

            return {
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
            }
        })
}
