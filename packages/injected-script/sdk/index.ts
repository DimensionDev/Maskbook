import { CustomEventId, decodeEvent } from '../shared/index.js'
import { Coin98Provider, Coin98ProviderType } from './Coin98.js'
import { CoinbaseProvider } from './Coinbase.js'
import { PhantomProvider } from './Phantom.js'
import { SolflareProvider } from './Solflare.js'
import { MetaMaskProvider } from './MetaMask.js'
import { sendEvent, rejectPromise, resolvePromise } from './utils.js'
import { OperaProvider } from './Opera.js'
import { CloverProvider } from './Clover.js'

export type { EthereumProvider, InternalEvents } from '../shared/index.js'
export { InjectedProvider } from './Base.js'

export const injectedCoin98EVMProvider = new Coin98Provider(Coin98ProviderType.EVM)
export const injectedCoin98SolanaProvider = new Coin98Provider(Coin98ProviderType.Solana)
export const injectedPhantomProvider = new PhantomProvider()
export const injectedSolflareProvider = new SolflareProvider()
export const injectedMetaMaskProvider = new MetaMaskProvider()
export const injectedCoinbaseProvider = new CoinbaseProvider()
export const injectedOperaProvider = new OperaProvider()
export const injectedCloverProvider = new CloverProvider()

export function pasteText(text: string) {
    sendEvent('paste', text)
}
export function pasteImage(image: Uint8Array) {
    sendEvent('pasteImage', Array.from(image))
}
export function pasteInstagram(image: Uint8Array) {
    sendEvent('instagramUpload', Array.from(image))
}
export function inputText(text: string) {
    sendEvent('input', text)
}
export function hookInputUploadOnce(
    format: string,
    fileName: string,
    image: Uint8Array,
    triggerOnActiveElementNow = false,
) {
    sendEvent('hookInputUploadOnce', format, fileName, Array.from(image), triggerOnActiveElementNow)
}

if (typeof location === 'object' && location.protocol.includes('extension')) {
    console.warn(
        'This package is not expected to be imported in background script or the extension script. Please check your code.',
    )
}
globalThis.document?.addEventListener?.(CustomEventId, (e) => {
    const r = decodeEvent((e as CustomEvent).detail)
    if (r[1].length < 1) return

    switch (r[0]) {
        case 'resolvePromise':
            return resolvePromise(...r[1])
        case 'rejectPromise':
            return rejectPromise(...r[1])

        case 'web3BridgeEmitEvent':
            const [pathname, eventName, data] = r[1]
            const provider = [
                injectedCoin98EVMProvider,
                injectedCoin98SolanaProvider,
                injectedPhantomProvider,
                injectedMetaMaskProvider,
                injectedOperaProvider,
                injectedCloverProvider,
            ].find((x) => x.pathname === pathname)

            provider?.emit(eventName, data)
            return

        case 'web3BridgeBindEvent':
        case 'web3BridgeSendRequest':
        case 'web3BridgeExecute':
        case 'web3UntilBridgeOnline':
        case 'web3BridgePrimitiveAccess':
        case 'input':
        case 'paste':
        case 'pasteImage':
        case 'instagramUpload':
        case 'hookInputUploadOnce':
            break
        default:
            const neverEvent: never = r[0]
            console.log('[@masknet/injected-script]', neverEvent, 'not handled')
    }
})
