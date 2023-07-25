import { createWeb3FromProvider } from './createWeb3FromProvider.js'
import { createWeb3ProviderFromURL } from './createWeb3ProviderFromURL.js'

export function createWeb3FromURL(url: string) {
    return createWeb3FromProvider(createWeb3ProviderFromURL(url))
}
