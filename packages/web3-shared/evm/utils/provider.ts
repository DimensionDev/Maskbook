import { noop } from 'lodash-unified'
import type { RequestArguments } from 'web3-core'
import type { Web3Provider } from '../types'

export function createWeb3Provider(request: <T>(requestArguments: RequestArguments) => Promise<T>): Web3Provider {
    return {
        // @ts-ignore
        on: noop,
        // @ts-ignore
        removeListener: noop,

        request,
    }
}
