import { CustomEventId, decodeEvent } from '../shared'
import { instagramUpload } from './EventListenerPatch/instagramUpload'
import { getCustomEventDetail, apply, warn } from './intrinsic'
import { dispatchInput } from './EventListenerPatch/dispatchInput'
import { dispatchPaste } from './EventListenerPatch/dispatchPaste'
import { dispatchPasteImage } from './EventListenerPatch/dispatchPasteImage'
import {
    ethBridgeSendRequest,
    ethBridgeIsConnected,
    ethBridgeMetaMaskIsUnlocked,
    ethBridgePrimitiveAccess,
    ethBridgeWatchEvent,
    untilEthereumOnline,
} from './EthBridge/methods'

document.addEventListener(CustomEventId, (e) => {
    const r = decodeEvent(getCustomEventDetail(e as CustomEvent))

    if (r[1].length < 1) return

    switch (r[0]) {
        case 'input':
            return apply(dispatchInput, null, r[1])
        case 'paste':
            return apply(dispatchPaste, null, r[1])
        case 'instagramUpload':
            return apply(instagramUpload, null, r[1])
        case 'pasteImage':
            return apply(dispatchPasteImage, null, r[1])
        case 'ethBridgeRequestListen':
            return apply(ethBridgeWatchEvent, null, r[1])
        case 'ethBridgeSendRequest':
            return apply(ethBridgeSendRequest, null, r[1])
        case 'ethBridgeIsConnected':
            return apply(ethBridgeIsConnected, null, r[1])
        case 'ethBridgeMetaMaskIsUnlocked':
            return apply(ethBridgeMetaMaskIsUnlocked, null, r[1])
        case 'ethBridgePrimitiveAccess':
            return apply(ethBridgePrimitiveAccess, null, r[1])
        case 'untilEthBridgeOnline':
            return apply(untilEthereumOnline, null, r[1])

        case 'ethBridgeOnEvent':
        case 'rejectPromise':
        case 'resolvePromise':
            return
        default:
            const neverEvent: never = r[0]
            warn('[@masknet/injected-script]', neverEvent, 'not handled')
    }
})
