import type { InternalEvents } from '../../shared/index.js'
import { $ } from '../intrinsic.js'
import { __DataTransfer, __DataTransferItemList } from './DataTransfer.js'
import { DispatchEvent, __Event } from './Event.js'

export function dispatchPaste(text: InternalEvents['paste'][0]) {
    const event = new __Event.ClipboardEvent('paste', {
        __proto__: null,
        clipboardData: new __DataTransfer(__DataTransferItemList.from(text)),
        bubbles: true,
        cancelable: true,
    })
    DispatchEvent($.DocumentActiveElement(), event)
}
