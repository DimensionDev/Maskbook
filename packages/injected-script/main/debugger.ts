import * as Bridge from './GlobalVariableBridge/index.js'
import { $, $unsafe } from './intrinsic.js'
import { unwrapXRayVision } from './intrinsic_content.js'

$.defineProperties(unwrapXRayVision(window), {
    Bridge: { value: $unsafe.fromSafe(Bridge) },
    PrivilegedObject: { value: { data: 1 } },
})
