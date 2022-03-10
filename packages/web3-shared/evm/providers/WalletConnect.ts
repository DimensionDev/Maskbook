import type { RequestArguments } from 'web3-core'
import { first, noop } from 'lodash-unified'
import { getEnumAsArray } from '@dimensiondev/kit'
import WalletConnectSDK from '@walletconnect/web3-provider'
import { ChainId, EthereumMethodType } from '../types'
import { getRPCConstants } from '../constants'

const rpc = getEnumAsArray(ChainId).reduce<Record<number, string>>((accumulator, item) => {
    const rpc = first(getRPCConstants(item.value).RPC)
    if (rpc) {
        accumulator[item.value] = rpc
    }
    return accumulator
}, {})

const sdk = new WalletConnectSDK({
    rpc,
})

export default {
    login() {
        return sdk.enable()
    },
    logout() {
        return sdk.disconnect()
    },
    request<T extends unknown>(requestArguments: RequestArguments) {
        switch (requestArguments.method) {
            case EthereumMethodType.MASK_REQUEST_ACCOUNTS:
                return this.login()
            case EthereumMethodType.MASK_DISMISS_ACCOUNTS:
                return this.logout()
            default:
                return sdk.sendAsyncPromise(requestArguments.method, requestArguments.params) as Promise<T>
        }
    },
    on(name: string, callback: (error: Error | null, payload: any) => void) {
        sdk.connector.on(name, callback)
        return noop
    },
}
