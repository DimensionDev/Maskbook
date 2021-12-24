import BigNumber from 'bignumber.js'
import type { WalletTokenRecord } from './type'
import { ChainId, getChainIdFromName } from '@masknet/web3-shared-evm'
import { CurrencyType, TokenType, Web3Plugin } from '@masknet/plugin-infra'
import { multipliedBy, rightShift } from '@masknet/web3-shared-base'

type Asset = Web3Plugin.Asset<Web3Plugin.FungibleToken>

export function formatAssets(data: WalletTokenRecord[]): Asset[] {
    return data
        .filter((x) => x.is_verified)
        .map((y): Asset => {
            const chainIdFromChain = getChainIdFromName(y.chain) ?? ChainId.Mainnet
            const address = y.id === 'eth' ? '' : y.id

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
                    [CurrencyType.USD]: new BigNumber(y.price ?? 0).toFixed(),
                },
                value: {
                    [CurrencyType.USD]: multipliedBy(y.price ?? 0, y.amount).toFixed(),
                },
                logoURI: y.logo_url,
            }
        })
}
