import createMetaMaskProvider from 'metamask-extension-provider'
import type { HttpProvider } from 'web3-core'

let provider: unknown

export function createProvider() {
    if (!provider) provider = createMetaMaskProvider()
    return provider as HttpProvider
}
