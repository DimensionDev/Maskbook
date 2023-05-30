import { CustomEventId, decodeEvent } from '../shared/index.js'
import { instagramUpload } from './EventListenerPatch/instagramUpload.js'
import { $, $Blessed } from './intrinsic.js'
import { dispatchInput } from './EventListenerPatch/dispatchInput.js'
import { dispatchPaste } from './EventListenerPatch/dispatchPaste.js'
import { dispatchPasteImage } from './EventListenerPatch/dispatchPasteImage.js'
import { callRequest, access, bindEvent, execute, until } from './GlobalVariableBridge/index.js'
import { hookInputUploadOnce } from './EventListenerPatch/hookInputUploadOnce.js'
import { DispatchEvent, __Event } from './EventListenerPatch/Event.js'
import { cloneIntoContent, unwrapXRayVision } from './utils.js'

Object.assign(
    unwrapXRayVision(window),
    cloneIntoContent({
        dispatchInput,
        dispatchPaste,
        instagramUpload,
        dispatchPasteImage,
        hookInputUploadOnce,
        _Event: __Event,
        DispatchEvent,
    }),
)
document.addEventListener(CustomEventId, (e) => {
    const r = decodeEvent($.CustomEvent_detail_getter(e as CustomEvent))
    // r comes from JSON.parse, so it must be an ordinary object.
    $.setPrototypeOf(r, $Blessed.ArrayPrototype)

    const [type, args] = r
    $.setPrototypeOf(args, $Blessed.ArrayPrototype)
    if (args.length < 1) return

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
