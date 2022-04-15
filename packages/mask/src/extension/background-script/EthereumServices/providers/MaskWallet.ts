import MaskWallet from 'web3'
import type { HttpProvider } from 'web3-core'
import { PopupRoutes } from '@masknet/shared-base'
import { ChainId, getChainRPC, ProviderType } from '@masknet/web3-shared-evm'
import { currentChainIdSettings } from '../../../../plugins/Wallet/settings'
import { openPopupWindow } from '../../../../../background/services/helper'
import { WalletRPC } from '../../../../plugins/Wallet/messages'

// #region providers
const providerPool = new Map<string, HttpProvider>()

export function createProvider(url: string): HttpProvider {
    const provider =
        providerPool.get(url) ??
        new MaskWallet.providers.HttpProvider(url, {
            timeout: 20000, // ms
            // @ts-ignore
            clientConfig: {
                keepalive: true,
                keepaliveInterval: 1, // ms
            },
            reconnect: {
                auto: true,
                delay: 5000, // ms
                maxAttempts: Number.MAX_SAFE_INTEGER,
                onTimeout: true,
            },
        })
    providerPool.set(url, provider)
    return provider
}
// #endregion

// #region web3 instances
const instancePool = new Map<string, MaskWallet>()
const SEED = Math.floor(Math.random() * 4)

function createWeb3Instance(provider: HttpProvider) {
    return (
        instancePool.get(provider.host) ??
        (() => {
            const newInstance = new MaskWallet(provider)
            instancePool.set(provider.host, newInstance)
            return newInstance
        })()
    )
}

export function createWeb3({
    url = '',
    chainId = currentChainIdSettings.value,
    privKeys = [],
}: {
    url?: string
    chainId?: ChainId
    privKeys?: string[]
} = {}) {
    url = url || getChainRPC(chainId, SEED)
    const provider = createProvider(url)
    const web3 = createWeb3Instance(provider)
    if (privKeys.length) {
        web3.eth.accounts.wallet.clear()
        privKeys.forEach((k) => k && k !== '0x' && web3.eth.accounts.wallet.add(k))
    }
    return web3
}
// #endregion

export async function requestAccounts(chainId: ChainId) {
    const wallets = await WalletRPC.getWallets(ProviderType.MaskWallet)
    return new Promise<{
        chainId: ChainId
        accounts: string[]
    }>(async (resolve, reject) => {
        try {
            await WalletRPC.selectAccountPrepare((accounts, chainId) => {
                resolve({
                    chainId,
                    accounts,
                })
            })
            await openPopupWindow(wallets.length > 0 ? PopupRoutes.SelectWallet : undefined, {
                chainId,
            })
        } catch {
            reject(new Error('Failed to connect to Mask Network.'))
        }
    })
}
