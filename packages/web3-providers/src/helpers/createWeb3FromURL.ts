import { memoize } from 'lodash-es'
import type { Web3 } from '@masknet/web3-shared-evm'
import { createWeb3FromProvider } from './createWeb3FromProvider.js'
import { createWeb3ProviderFromURL } from './createWeb3ProviderFromURL.js'

function __create__(url: string) {
    return createWeb3FromProvider(createWeb3ProviderFromURL(url))
}

export const createWeb3FromURL: (url: string) => Web3 = memoize(__create__, (url) => url.toLowerCase())
