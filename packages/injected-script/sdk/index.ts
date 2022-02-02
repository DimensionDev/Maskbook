import { CustomEventId, decodeEvent } from '../shared'
import { onEthEvent } from './bridgedEthereum'
import { onCoin98Event } from './bridgedCoin98'
import { onSolanaEvent } from './bridgedSolana'
import { sendEvent, rejectPromise, resolvePromise } from './utils'

export { bridgedEthereumProvider } from './bridgedEthereum'
export { bridgedCoin98Provider } from './bridgedCoin98'
export { bridgedSolanaProvider } from './bridgedSolana'
export { bridgedTerraProvider } from './bridgedTerra'

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
        case 'resolvePromise':
            return resolvePromise(...r[1])
        case 'rejectPromise':
            return rejectPromise(...r[1])

        case 'ethBridgeOnEvent':
            return onEthEvent(...r[1])
        case 'coin98BridgeOnEvent':
            return onCoin98Event(...r[1])
        case 'solanaBridgeOnEvent':
            return onSolanaEvent(...r[1])
        case 'ethBridgeSendRequest':
        case 'ethBridgePrimitiveAccess':
        case 'ethBridgeRequestListen':
        case 'coin98BridgeSendRequest':
        case 'coin98BridgePrimitiveAccess':
        case 'coin98BridgeRequestListen':
        case 'solanaBridgeSendRequest':
        case 'solanaBridgePrimitiveAccess':
        case 'solanaBridgeRequestListen':
        case 'solanaBridgeExecute':
        case 'terraBridgeSendRequest':
        case 'terraBridgePrimitiveAccess':
        case 'terraBridgeRequestListen':
        case 'terraBridgeExecute':
        case 'input':
        case 'paste':
        case 'pasteImage':
        case 'instagramUpload':
        case 'untilEthBridgeOnline':
        case 'untilCoin98BridgeOnline':
        case 'untilSolanaBridgeOnline':
        case 'hookInputUploadOnce':
            break
        default:
            const neverEvent: never = r[0]
            console.log('[@masknet/injected-script]', neverEvent, 'not handled')
    }
})
