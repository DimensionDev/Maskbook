import * as Bridge from './GlobalVariableBridge/index.js'
import { DispatchEvent, __Event } from './Patches/Event.js'
import { dispatchInput } from './Patches/dispatchInput.js'
import { dispatchPaste } from './Patches/dispatchPaste.js'
import { dispatchPasteImage } from './Patches/dispatchPasteImage.js'
import { hookInputUploadOnce } from './Patches/hookInputUploadOnce.js'
import { $, $unsafe } from './intrinsic.js'
import { unwrapXRayVision } from './intrinsic_unsafe.js'
import * as __DataTransfer from './Patches/DataTransfer.js'

$.defineProperties(unwrapXRayVision(window), {
    Bridge: { value: $unsafe.structuredCloneFromSafe(Bridge) },
    __DataTransfer: {
        value: $unsafe.structuredCloneFromSafe({
            DataTransfer: __DataTransfer.__DataTransfer,
            DataTransferItem: __DataTransfer.__DataTransferItem,
            DataTransferItemList: __DataTransfer.__DataTransferItemList,
            FileList: __DataTransfer.__FileList,
        }),
    },
    PrivilegedObject: { value: { data: 1 } },
    __Event: { value: $unsafe.structuredCloneFromSafe({ dispatchEvent: DispatchEvent, Event: __Event }) },
    __Action: {
        value: $unsafe.structuredCloneFromSafe({
            dispatchInput,
            dispatchPaste,
            dispatchPasteImage,
            hookInputUploadOnce,
        }),
    },
})
