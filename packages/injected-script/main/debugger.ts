import * as Bridge from './GlobalVariableBridge/index.js'
import { DispatchEvent, __Event } from './Patches/Event.js'
import { dispatchInput } from './Patches/dispatchInput.js'
import { dispatchPaste } from './Patches/dispatchPaste.js'
import { dispatchPasteImage } from './Patches/dispatchPasteImage.js'
import { $, $unsafe } from './intrinsic.js'
import { unwrapXRayVision } from './intrinsic_unsafe.js'

$.defineProperties(unwrapXRayVision(window), {
    Bridge: { value: $unsafe.structuredCloneFromSafe(Bridge) },
    PrivilegedObject: { value: { data: 1 } },
    __Event: { value: $unsafe.structuredCloneFromSafe({ dispatchEvent: DispatchEvent, Event: __Event }) },
    __Action: { value: $unsafe.structuredCloneFromSafe({ dispatchInput, dispatchPaste, dispatchPasteImage }) },
})
