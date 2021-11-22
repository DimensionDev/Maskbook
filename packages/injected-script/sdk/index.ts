import { CustomEventId, decodeEvent } from '../shared'
import { onEthEvent } from './bridgedEthereum'
import { onSolanaEvent } from './bridgedSolana'
import { sendEvent, rejectPromise, resolvePromise } from './utils'

export { bridgedEthereumProvider } from './bridgedEthereum'
export type { BridgedEthereumProvider } from './bridgedEthereum'
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
export function hookInputUploadOnce(format: string, fileName: string, image: Uint8Array) {
    sendEvent('hookInputUploadOnce', format, fileName, Array.from(image))
}

document.addEventListener(CustomEventId, (e) => {
    const r = decodeEvent((e as CustomEvent).detail)
    if (r[1].length < 1) return

    switch (r[0]) {
        case 'ethBridgeOnEvent':
            return onEthEvent(...r[1])
        case 'solanaBridgeOnEvent':
            return onSolanaEvent(...r[1])
        case 'resolvePromise':
            return resolvePromise(...r[1])
        case 'rejectPromise':
            return rejectPromise(...r[1])
        case 'ethBridgeSendRequest':
        case 'ethBridgeIsConnected':
        case 'ethBridgeMetaMaskIsUnlocked':
        case 'ethBridgePrimitiveAccess':
        case 'ethBridgeRequestListen':
        case 'solanaBridgeSendRequest':
        case 'solanaBridgeIsConnected':
        case 'solanaBridgePrimitiveAccess':
        case 'solanaBridgeRequestListen':
        case 'input':
        case 'paste':
        case 'pasteImage':
        case 'instagramUpload':
        case 'untilEthBridgeOnline':
        case 'untilSolanaBridgeOnline':
        case 'hookInputUploadOnce':
            break
        default:
            const neverEvent: never = r[0]
            console.log('[@masknet/injected-script]', neverEvent, 'not handled')
    }
})
