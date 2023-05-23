import { CustomEventId, decodeEvent } from '../shared/index.js'
import { instagramUpload } from './EventListenerPatch/instagramUpload.js'
import { $, $Blessed } from './intrinsic.js'
import { dispatchInput } from './EventListenerPatch/dispatchInput.js'
import { dispatchPaste } from './EventListenerPatch/dispatchPaste.js'
import { dispatchPasteImage } from './EventListenerPatch/dispatchPasteImage.js'
import {
    __content__callRequest,
    __content__access,
    __content__onEvent,
    __content__call,
    __content__until,
} from './GlobalVariableBridge/index.js'
import { hookInputUploadOnce } from './EventListenerPatch/hookInputUploadOnce.js'

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
            return __content__onEvent(...args)
        case 'web3BridgeEmitEvent':
            return
        case 'web3BridgeSendRequest':
            return __content__callRequest(...args)
        case 'web3BridgePrimitiveAccess':
            return __content__access(...args)
        case 'web3UntilBridgeOnline':
            return __content__until(...args)
        case 'web3BridgeExecute':
            return __content__call(...args)

        default:
            const neverEvent: never = type
            $.ConsoleError('[@masknet/injected-script]', neverEvent, 'not handled')
    }
})
