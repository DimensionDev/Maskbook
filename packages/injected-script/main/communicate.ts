import { CustomEventId, decodeEvent } from '../shared'
import { instagramUpload } from './EventListenerPatch/instagramUpload'
import { getCustomEventDetail, apply, warn } from './intrinsic'
import { dispatchInput } from './EventListenerPatch/dispatchInput'
import { dispatchPaste } from './EventListenerPatch/dispatchPaste'
import { dispatchPasteImage } from './EventListenerPatch/dispatchPasteImage'
import { callRequest, access, bindEvent, until } from './GlobalVariableBridge'
import { hookInputUploadOnce } from './EventListenerPatch/hookInputUploadOnce'

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
        case 'hookInputUploadOnce':
            return apply(hookInputUploadOnce, null, r[1])
        case 'rejectPromise':
        case 'resolvePromise':
            return

        // solana
        case 'solanaBridgeRequestListen':
            return apply(bindEvent, null, ['solana', 'solanaBridgeOnEvent', ...r[1]])
        case 'solanaBridgeSendRequest':
            return apply(callRequest, null, ['solana', ...r[1]])
        case 'solanaBridgePrimitiveAccess':
            return apply(access, null, ['solana', ...r[1]])
        case 'untilSolanaBridgeOnline':
            return apply(until, null, ['solana', ...r[1]])
        case 'solanaBridgeOnEvent':
            return

        // ethereum
        case 'ethBridgeRequestListen':
            return apply(bindEvent, null, ['ethereum', 'ethBridgeOnEvent', ...r[1]])
        case 'ethBridgeSendRequest':
            return apply(callRequest, null, ['ethereum', ...r[1]])
        case 'ethBridgePrimitiveAccess':
            return apply(access, null, ['ethereum', ...r[1]])
        case 'untilEthBridgeOnline':
            return apply(until, null, ['ethereum', ...r[1]])
        case 'ethBridgeOnEvent':
            return

        // coin98
        case 'coin98BridgeRequestListen':
            return apply(bindEvent, null, ['coin98.provider', 'coin98BridgeOnEvent', ...r[1]])
        case 'coin98BridgeSendRequest':
            return apply(callRequest, null, ['coin98.provider', ...r[1]])
        case 'coin98BridgePrimitiveAccess':
            return apply(access, null, ['coin98.provider', ...r[1]])
        case 'untilCoin98BridgeOnline':
            return apply(until, null, ['coin98', ...r[1]])
        case 'coin98BridgeOnEvent':
            return

        default:
            const neverEvent: never = r[0]
            warn('[@masknet/injected-script]', neverEvent, 'not handled')
    }
})
