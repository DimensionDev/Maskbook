import MaskWallet from 'web3'
import type { HttpProvider } from 'web3-core'
import { ChainId, getChainRPC } from '@masknet/web3-shared-evm'
import { currentChainIdSettings } from '../../../../plugins/Wallet/settings'
import { getWallets } from '../../../../plugins/Wallet/services'

//#region providers
const providerPool = new Map<string, HttpProvider>()

export function createProvider(url: string) {
    const provider =
        providerPool.get(url) ??
        new MaskWallet.providers.HttpProvider(url, {
            timeout: 5000, // ms
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
//#endregion

//#region web3 instances
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
//#endregion

export async function requestAccounts() {
    const wallets = await getWallets()
    const accounts = wallets.filter((x) => x._private_key_ || x.mnemonic.length).map((y) => y.address)
    return {
        accounts,
        chainId: currentChainIdSettings.value,
    }
}
