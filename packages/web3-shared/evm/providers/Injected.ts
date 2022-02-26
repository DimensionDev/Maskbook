import type { RequestArguments } from 'web3-core'
import type { EthereumProvider } from '@masknet/injected-script'
import { EIP1193Provider, EthereumMethodType } from '../types'

export default class InjectedSDK implements EIP1193Provider {
    constructor(private bridge: EthereumProvider) {}

    async login() {
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
        switch (requestArguments.method) {
            case EthereumMethodType.MASK_REQUEST_ACCOUNTS:
                return this.login() as Promise<T>
            case EthereumMethodType.MASK_DISMISS_ACCOUNTS:
                return this.logout() as Promise<T>
            default:
                return this.bridge.request<T>(requestArguments)
        }
    }

    removeListener(name: string, listener: (event: any) => void): EIP1193Provider {
        return this
    }
}
