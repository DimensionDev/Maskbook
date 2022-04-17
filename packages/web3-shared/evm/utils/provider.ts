import { noop } from 'lodash-unified'
import Web3 from 'web3'
import type { RequestArguments } from 'web3-core'
import type { EIP1193Provider, RequestOptions, SendOverrides } from '../types'

export function createEIP1193Provider(
    request: <T>(requestArguments: RequestArguments, overrides?: SendOverrides, options?: RequestOptions) => Promise<T>,
    getOverrides?: () => SendOverrides,
    getOptions?: () => RequestOptions,
): EIP1193Provider {
    return {
        // @ts-ignore
        on: noop,
        // @ts-ignore
        removeListener: noop,
        request: <T>(requestArguments: RequestArguments) =>
            request<T>(requestArguments, getOverrides?.(), getOptions?.()),
    }
}

export function createWeb3(
    request: <T extends unknown>(
        requestArguments: RequestArguments,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ) => Promise<T>,
    getOverrides?: () => SendOverrides,
    getOptions?: () => RequestOptions,
) {
    // @ts-ignore
    return new Web3(createEIP1193Provider(request, getOverrides, getOptions))
}
