import { CustomEventId, decodeEvent } from '../shared'
import { instagramUpload } from './EventListenerPatch/instagramUpload'
import { getCustomEventDetail, apply, warn } from './intrinsic'
import { dispatchInput } from './EventListenerPatch/dispatchInput'
import { dispatchPaste } from './EventListenerPatch/dispatchPaste'
import { dispatchPasteImage } from './EventListenerPatch/dispatchPasteImage'
import { callRequest, access, bindEvent, execute, until } from './GlobalVariableBridge'
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

        // web3
        case 'web3BridgeBindEvent':
            return apply(bindEvent, null, r[1])
        case 'web3BridgeEmitEvent':
            return
        case 'web3BridgeSendRequest':
            return apply(callRequest, null, r[1])
        case 'web3BridgePrimitiveAccess':
            return apply(access, null, r[1])
        case 'web3UntilBridgeOnline':
            return apply(until, null, r[1])
        case 'web3BridgeExecute':
            return apply(execute, null, r[1])

        default:
            const neverEvent: never = r[0]
            warn('[@masknet/injected-script]', neverEvent, 'not handled')
    }
})
