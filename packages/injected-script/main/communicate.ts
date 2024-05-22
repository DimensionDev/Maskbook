import { CustomEventId, decodeEvent } from '../shared/index.js'
import { instagramUpload } from './Patches/instagramUpload.js'
import { $, $safe } from './intrinsic.js'
import { dispatchInput } from './Patches/dispatchInput.js'
import { dispatchPaste } from './Patches/dispatchPaste.js'
import { dispatchPasteImage } from './Patches/dispatchPasteImage.js'
import {
    __unsafe__callRequest,
    __unsafe__getValue,
    __unsafe__onEvent,
    __unsafe__call,
    __unsafe__until,
} from './GlobalVariableBridge/index.js'
import { hookInputUploadOnce } from './Patches/hookInputUploadOnce.js'

document.addEventListener(CustomEventId, (e) => {
    const [type, args] = $.setPrototypeOf(decodeEvent($.CustomEvent_detail(e as CustomEvent)), $safe.ArrayPrototype)
    $.setPrototypeOf(args, $safe.ArrayPrototype)
    if (args.length < 1) return

    switch (type) {
        case 'rejectPromise':
        case 'resolvePromise':
            return

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

        // web3
        case 'web3BridgeBindEvent':
            return __unsafe__onEvent(...args)
        case 'web3BridgeEmitEvent':
            return
        case 'web3BridgeSendRequest':
            return __unsafe__callRequest(...args)
        case 'web3BridgePrimitiveAccess':
            return __unsafe__getValue(...args)
        case 'web3UntilBridgeOnline':
            return __unsafe__until(...args)
        case 'web3BridgeExecute':
            return __unsafe__call(...args)

        default:
            const neverEvent: never = type
            $.console_error('[@masknet/injected-script]', neverEvent, 'not handled')
    }
})
