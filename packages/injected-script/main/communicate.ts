import { CustomEventId, decodeEvent } from '../shared'
import { instagramUpload } from './EventListenerPatch/instagramUpload'
import { $, bless } from './intrinsic'
import { dispatchInput } from './EventListenerPatch/dispatchInput'
import { dispatchPaste } from './EventListenerPatch/dispatchPaste'
import { dispatchPasteImage } from './EventListenerPatch/dispatchPasteImage'
import { callRequest, access, bindEvent, execute, until } from './GlobalVariableBridge'
import { hookInputUploadOnce } from './EventListenerPatch/hookInputUploadOnce'

document.addEventListener(CustomEventId, (e) => {
    const r = decodeEvent($.CustomEvent_detail_getter(e as CustomEvent))
    if (r[1].length < 1) return

    bless(r, $.ArrayDesc)
    bless(r[1], $.ArrayDesc)

    const [type, args] = r

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
        case 'rejectPromise':
        case 'resolvePromise':
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
