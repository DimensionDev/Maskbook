import { CustomEventId, decodeEvent } from '../shared/event.js'
import { instagramUpload } from './EventListenerPatch/instagramUpload.js'
import { $, bless } from '../shared/intrinsic.js'
import { dispatchInput } from './EventListenerPatch/dispatchInput.js'
import { dispatchPaste } from './EventListenerPatch/dispatchPaste.js'
import { dispatchPasteImage } from './EventListenerPatch/dispatchPasteImage.js'
import { callRequest, access, bindEvent, execute, until } from './GlobalVariableBridge/index.js'
import { hookInputUploadOnce } from './EventListenerPatch/hookInputUploadOnce.js'
import { rejectPromise, resolvePromise } from '../shared/rpc.js'

export let sdkReady = false
document.addEventListener(CustomEventId, (e) => {
    const r = decodeEvent($.CustomEvent_detail_getter(e as CustomEvent))
    if (r[1].length < 1) return

    bless(r, $.ArrayDesc)
    bless(r[1], $.ArrayDesc)

    const [type, args] = r
    sdkReady = true

    switch (type) {
        case 'input':
            return dispatchInput(...args)
        case 'paste':
            return dispatchPaste(...args)
        case 'instagramUpload':
            return instagramUpload(...args)
        case 'pasteImage':
            return dispatchPasteImage(...args)
        case 'hookInputUploadOnce':
            return hookInputUploadOnce(...args)
        case 'resolvePromise':
            return resolvePromise(...args)
        case 'rejectPromise':
            return rejectPromise(...args)
        case 'requestDecrypt':
        case 'sdk_ready':
            return

        // web3
        case 'web3BridgeBindEvent':
            return bindEvent(...args)
        case 'web3BridgeEmitEvent':
            return
        case 'web3BridgeSendRequest':
            return callRequest(...args)
        case 'web3BridgePrimitiveAccess':
            return access(...args)
        case 'web3UntilBridgeOnline':
            return until(...args)
        case 'web3BridgeExecute':
            return execute(...args)

        default:
            const neverEvent: never = type
            $.ConsoleError('[@masknet/injected-script]', neverEvent, 'not handled')
    }
})
