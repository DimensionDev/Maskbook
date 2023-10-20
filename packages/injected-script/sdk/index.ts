import { BrowserProvider } from './Browser.js'
import { Coin98Provider, Coin98ProviderType } from './Coin98.js'
import { CoinbaseProvider } from './Coinbase.js'
import { OKXProvider } from './OKX.js'
import { PhantomProvider } from './Phantom.js'
import { SolflareProvider } from './Solflare.js'
import { MetaMaskProvider } from './MetaMask.js'
import { WalletConnectProvider } from './WalletConnect.js'
import { OperaProvider } from './Opera.js'
import { CloverProvider } from './Clover.js'
import { sendEvent, rejectPromise, resolvePromise } from './utils.js'
import { CustomEventId, decodeEvent } from '../shared/index.js'

export type { EthereumProvider, InternalEvents } from '../shared/index.js'
export { InjectedProvider } from './Base.js'

export const injectedCoin98EVMProvider = new Coin98Provider(Coin98ProviderType.EVM)
export const injectedCoin98SolanaProvider = new Coin98Provider(Coin98ProviderType.Solana)
export const injectedPhantomProvider = new PhantomProvider()
export const injectedSolflareProvider = new SolflareProvider()
export const injectedBrowserProvider = new BrowserProvider()
export const injectedCoinbaseProvider = new CoinbaseProvider()
export const injectedOKXProvider = new OKXProvider()
export const injectedOperaProvider = new OperaProvider()
export const injectedCloverProvider = new CloverProvider()

export const wagmiMetaMaskProvider = new MetaMaskProvider()
export const wagmiWalletConnectProvider = new WalletConnectProvider()

// Please keep this list update to date
const Providers = [
    injectedCoinbaseProvider,
    injectedOKXProvider,
    injectedOperaProvider,
    injectedCloverProvider,
    injectedBrowserProvider,
    injectedCoin98EVMProvider,
    injectedCoin98SolanaProvider,
    injectedPhantomProvider,
]

const WagmiProviders = [wagmiMetaMaskProvider, wagmiWalletConnectProvider]

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

        // wagmi
        case 'wagmiEmitEvent': {
            const [providerType, eventName, data] = r[1]
            WagmiProviders.filter((x) => x.providerType === providerType).forEach((x) => x?.emit(eventName, data))
            break
        }
        case 'wagmiExecute':
            break

        // web3
        case 'web3BridgeEmitEvent': {
            const [pathname, eventName, data] = r[1]
            Providers.filter((x) => x.pathname === pathname).forEach((x) => x?.emit(eventName, data))
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
