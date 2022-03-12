import type { RequestArguments } from 'web3-core'
import type { EthereumProvider } from '@masknet/injected-script'
import { EIP1193Provider, EthereumMethodType } from '../types'

export default class InjectedSDK implements EIP1193Provider {
    constructor(private bridge: EthereumProvider) {}

    async login() {
        const available = await this.bridge.untilAvailable()
        if (!available) return []
        return this.request<string[]>({
            method: EthereumMethodType.ETH_REQUEST_ACCOUNTS,
            params: [],
        })
    }

    async logout() {}

    on(name: string, listener: (event: any) => void) {
        this.bridge.on(name, listener)
        return this
    }

    off(name: string, listener: (event: any) => void) {
        this.bridge.off(name, listener)
        return this
    }

    request<T extends unknown>(requestArguments: RequestArguments): Promise<T> {
        return this.bridge.request<T>(requestArguments)
    }

    removeListener(name: string, listener: (event: any) => void): EIP1193Provider {
        return this
    }
}
