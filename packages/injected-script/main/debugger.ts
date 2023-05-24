import * as Bridge from './GlobalVariableBridge/index.js'
import { DispatchEvent, __Event } from './Patches/Event.js'
import { $, $unsafe } from './intrinsic.js'
import { unwrapXRayVision } from './intrinsic_content.js'

$.defineProperties(unwrapXRayVision(window), {
    Bridge: { value: $unsafe.fromSafe(Bridge) },
    PrivilegedObject: { value: { data: 1 } },
    __Event: { value: $unsafe.fromSafe({ dispatchEvent: DispatchEvent, Event: __Event }) },
})
