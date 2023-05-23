import { CustomEventId, decodeEvent } from '../shared/index.js'
import { instagramUpload } from './EventListenerPatch/instagramUpload.js'
import { $, $Blessed } from './intrinsic.js'
import { dispatchInput } from './EventListenerPatch/dispatchInput.js'
import { dispatchPaste } from './EventListenerPatch/dispatchPaste.js'
import { dispatchPasteImage } from './EventListenerPatch/dispatchPasteImage.js'
import {
    __unsafe__callRequest,
    __unsafe__access,
    __unsafe__onEvent,
    __unsafe__call,
    __unsafe__until,
} from './GlobalVariableBridge/index.js'
import { hookInputUploadOnce } from './EventListenerPatch/hookInputUploadOnce.js'

document.addEventListener(CustomEventId, (e) => {
    const [type, args] = $Blessed.ExistArray(decodeEvent($.CustomEvent_detail_getter(e as CustomEvent)))

    $Blessed.ExistArray(args)
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
            return __unsafe__onEvent(...args)
        case 'web3BridgeEmitEvent':
            return
        case 'web3BridgeSendRequest':
            return __unsafe__callRequest(...args)
        case 'web3BridgePrimitiveAccess':
            return __unsafe__access(...args)
        case 'web3UntilBridgeOnline':
            return __unsafe__until(...args)
        case 'web3BridgeExecute':
            return __unsafe__call(...args)

        default:
            const neverEvent: never = type
            $.ConsoleError('[@masknet/injected-script]', neverEvent, 'not handled')
    }
})
