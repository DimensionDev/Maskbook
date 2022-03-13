import { first } from 'lodash-unified'
import type { RequestArguments } from 'web3-core'
import { getEnumAsArray } from '@dimensiondev/kit'
import WalletConnect from '@walletconnect/web3-provider'
import { ChainId, EIP1193Provider, EthereumMethodType } from '../types'
import { getRPCConstants } from '../constants'

export default class WalletConnectSDK implements EIP1193Provider {
    private rpc = getEnumAsArray(ChainId).reduce<Record<number, string>>((accumulator, item) => {
        const url = first(getRPCConstants(item.value).RPC)
        if (url) {
            accumulator[item.value] = url
        }
        return accumulator
    }, {})

    private sdk = new WalletConnect({
        rpc: this.rpc,
    })

    login() {
        return this.sdk.enable()
    }
    logout() {
        return this.sdk.disconnect()
    }
    async request<T extends unknown>(requestArguments: RequestArguments) {
        switch (requestArguments.method) {
            case EthereumMethodType.MASK_REQUEST_ACCOUNTS:
                await this.logout()
                const accounts = await this.login()
                console.log('DEBUG: log in')
                console.log({
                    accounts,
                })
                return accounts as T
            case EthereumMethodType.MASK_DISMISS_ACCOUNTS:
                return this.logout() as Promise<T>
            default:
                return this.sdk.request(requestArguments) as Promise<T>
        }
    }
    on(name: string, listener: (event: any) => void) {
        this.sdk.wc.on(name, listener)
        return this
    }
    removeListener(name: string, listener: (event: any) => void) {
        try {
            // @ts-ignore the type declaration is lying
            this.sdk.wc.off(name)
        } catch {
            // do nothing
        }
        return this
    }
}
