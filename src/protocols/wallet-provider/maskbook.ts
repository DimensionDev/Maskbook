import Web3 from 'web3'
import type { HttpProvider } from 'web3-core'
import type { HttpProviderOptions } from 'web3-core-helpers'
import type { EthereumNetwork } from '../../plugins/Wallet/database/types'
import { getNetworkSettings } from '../../plugins/Wallet/UI/EthereumNetworkSettings'
import { getManagedWallets } from '../../plugins/Wallet/wallet'
import { web3 } from '../../plugins/Wallet/web3'
import { currentLocalWalletEthereumNetworkSettings } from '../../settings/settings'
import type { WalletProvider } from './index'

type SwitchableProvider = { switch(network: EthereumNetwork): void; disconnect(): void }
function SwitchableProvider(opts?: HttpProviderOptions): SwitchableProvider & HttpProvider {
    let activatingProvider: HttpProvider
    const pool = new Map<string, HttpProvider>()
    const extra: SwitchableProvider = {
        switch(network) {
            const addr = getNetworkSettings(network).middlewareAddress
            pool.get(addr)?.disconnect()
            activatingProvider = new Web3.providers.HttpProvider(addr, opts)
            pool.set(addr, activatingProvider)
            console.log('[Managed Web3] Switch', network)
        },
        disconnect() {
            for (const each of pool.values()) each.disconnect()
        },
    }
    extra.switch(currentLocalWalletEthereumNetworkSettings.value)
    currentLocalWalletEthereumNetworkSettings.addListener((next) => extra.switch(next))
    return new Proxy({} as HttpProvider & SwitchableProvider, {
        get(_, key) {
            const origProp = (activatingProvider as any)[key]
            const extraProp = (extra as any)[key]
            if (extraProp) return extraProp
            if (typeof origProp === 'function') return origProp.bind(activatingProvider)
            return origProp
        },
    })
}
let provider: ReturnType<typeof SwitchableProvider> | undefined = undefined
export const MaskbookProvider: WalletProvider = {
    checkAvailability: () => Promise.resolve(true),
    async requestAccounts() {
        const wallets = await getManagedWallets()
        return wallets.wallets.map((x) => x.address)
    },
    getWeb3Provider() {
        if (provider) return provider
        provider = SwitchableProvider({
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
        return provider
    },
    noLongerUseWeb3Provider() {
        ;(web3.currentProvider as HttpProvider).disconnect()
        provider = undefined
    },
}
