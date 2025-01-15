import { BrowserProvider } from './Browser.js'
import { Coin98Provider, Coin98ProviderType } from './Coin98.js'
import { CoinbaseProvider } from './Coinbase.js'
import { OKXProvider, OKXSolanaProvider } from './OKX.js'
import { CryptoProvider } from './Crypto.js'
import { BitGetProvider } from './BitGet.js'
import { RainbowProvider } from './Rainbow.js'
import { OneKeyProvider } from './OneKey.js'
import { RabbyProvider } from './Rabby.js'
import { TrustProvider } from './Trust.js'
import { TokenPocketProvider } from './TokenPocket.js'
import { ZerionProvider } from './Zerion.js'
import { PhantomProvider } from './Phantom.js'
import { SolflareProvider } from './Solflare.js'
import { OperaProvider } from './Opera.js'
import { CloverProvider } from './Clover.js'
import { MetaMaskProvider } from './MetaMask.js'
import { sendEvent, rejectPromise, resolvePromise } from './utils.js'
import { CustomEventId, decodeEvent } from '../shared/index.js'

export type { EthereumProvider, InternalEvents } from '../shared/index.js'
export { InjectedWalletBridge } from './BaseInjected.js'

export const injectedCoin98EVMProvider = new Coin98Provider(Coin98ProviderType.EVM)
export const injectedCoin98SolanaProvider = new Coin98Provider(Coin98ProviderType.Solana)
export const injectedPhantomProvider = new PhantomProvider()
export const injectedSolflareProvider = new SolflareProvider()
export const injectedBrowserProvider = new BrowserProvider()
export const injectedMetaMaskProvider = new MetaMaskProvider()
export const injectedCoinbaseProvider = new CoinbaseProvider()
export const injectedOneKeyProvider = new OneKeyProvider()
export const injectedOKXProvider = new OKXProvider()
export const injectedOKXSolanaProvider = new OKXSolanaProvider()
export const injectedCryptoProvider = new CryptoProvider()
export const injectedBitGetProvider = new BitGetProvider()
export const injectedRainbowProvider = new RainbowProvider()
export const injectedRabbyProvider = new RabbyProvider()
export const injectedTrustProvider = new TrustProvider()
export const injectedTokenPocketProvider = new TokenPocketProvider()
export const injectedZerionProvider = new ZerionProvider()
export const injectedOperaProvider = new OperaProvider()
export const injectedCloverProvider = new CloverProvider()

// Please keep this list update to date
const Providers = [
    injectedBitGetProvider,
    injectedCoinbaseProvider,
    injectedCryptoProvider,
    injectedOneKeyProvider,
    injectedRabbyProvider,
    injectedRainbowProvider,
    injectedOKXProvider,
    injectedZerionProvider,
    injectedOperaProvider,
    injectedCloverProvider,
    injectedBrowserProvider,
    injectedCoin98EVMProvider,
    injectedCoin98SolanaProvider,
    injectedPhantomProvider,
    injectedMetaMaskProvider,
    injectedTrustProvider,
    injectedTokenPocketProvider,
]

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
    if (location.href.includes('background')) {
        throw new Error('This package is not expected to be imported in background script. Please check your code.')
    }
    console.warn('This package is not expected to be imported in the extension script. Please check your code.')
}

globalThis.document?.addEventListener?.(CustomEventId, (e) => {
    const r = decodeEvent((e as CustomEvent).detail)
    if (r[1].length < 1) return

    switch (r[0]) {
        case 'resolvePromise':
            return resolvePromise(...r[1])
        case 'rejectPromise':
            return rejectPromise(...r[1])

        // web3
        case 'web3BridgeEmitEvent': {
            const [pathname, eventName, data] = r[1]
            Providers.filter((x) => x.pathname === pathname).forEach((x) => x.emit(eventName, data))
            break
        }
        case 'web3BridgeBindEvent':
        case 'web3BridgeSendRequest':
        case 'web3BridgeExecute':
        case 'web3UntilBridgeOnline':
        case 'web3BridgePrimitiveAccess':
            break

        // misc
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
