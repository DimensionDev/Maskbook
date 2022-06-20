import { CustomEventId, decodeEvent } from '../shared'
import { Coin98Provider, Coin98ProviderType } from './Coin98'
import { PhantomProvider } from './Phantom'
import { SolflareProvider } from './Solflare'
import { MetaMaskProvider } from './MetaMask'
import { sendEvent, rejectPromise, resolvePromise } from './utils'
import { MathWalletProvider } from './MathWallet'
import { WalletLinkProvider } from './WalletLink'

export type { EthereumProvider, InternalEvents } from '../shared'

export const injectedCoin98EVMProvider = new Coin98Provider(Coin98ProviderType.EVM)
export const injectedCoin98SolanaProvider = new Coin98Provider(Coin98ProviderType.Solana)
export const injectedPhantomProvider = new PhantomProvider()
export const injectedSolflareProvider = new SolflareProvider()
export const injectedMetaMaskProvider = new MetaMaskProvider()
export const injectedMathWalletProvider = new MathWalletProvider()
export const injectedWalletLinkProvider = new WalletLinkProvider()

export function pasteText(text: string) {
    sendEvent('paste', text)
}
export function pasteImage(image: Uint8Array) {
    sendEvent('pasteImage', Array.from(image))
}
export function pasteInstagram(url: string) {
    sendEvent('instagramUpload', url)
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

document.addEventListener(CustomEventId, (e) => {
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
                injectedMathWalletProvider,
                injectedWalletLinkProvider,
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
