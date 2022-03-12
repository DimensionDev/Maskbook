import type { RequestArguments } from 'web3-core'
import type { ValueRef } from '@dimensiondev/holoflows-kit'
import { ChainId, EIP1193Provider, EthereumMethodType } from '../types'

export default class MaskWalletSDK implements EIP1193Provider {
    private listeners: Map<string, Set<(event: any) => void>> = new Map()

    constructor(
        public request: <T extends unknown>(requestArguments: RequestArguments) => Promise<T>,
        private settings: {
            currentChainIdSettings: ValueRef<ChainId>
            currentAccountSettings: ValueRef<string>
        },
    ) {
        this.settings.currentChainIdSettings.addListener(this.onCurrentChainIdChanged.bind(this))
        this.settings.currentAccountSettings.addListener(this.onCurrentAccountSettingsChanged.bind(this))
    }

    private onCurrentAccountSettingsChanged(account: string) {
        const listeners = this.listeners.get('accountsChanged') ?? []
        for (const listener of listeners) listener([account])
    }

    private onCurrentChainIdChanged(chainId: ChainId) {
        const listeners = this.listeners.get('chainChanged') ?? []
        for (const listener of listeners) listener(chainId)
    }

    async login() {
        return this.request<string[]>({
            method: EthereumMethodType.ETH_REQUEST_ACCOUNTS,
            params: [],
        })
    }

    async logout() {
        this.settings.currentChainIdSettings.removeListener(this.onCurrentChainIdChanged)
        this.settings.currentAccountSettings.removeListener(this.onCurrentAccountSettingsChanged)
    }

    on(name: string, listener: (event: any) => void) {
        if (!this.listeners.has(name)) this.listeners.set(name, new Set())
        this.listeners.get(name)!.add(listener)
        return this
    }

    removeListener(name: string, listener: (event: any) => void) {
        this.listeners.get(name)?.delete(listener)
        return this
    }
}
