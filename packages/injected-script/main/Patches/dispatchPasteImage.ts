import type { InternalEvents } from '../../shared/index.js'
import { $ } from '../intrinsic.js'
import { contentFileFromBufferSource } from '../utils.js'
import { __DataTransfer, __DataTransferItemList } from './DataTransfer.js'
import { DispatchEvent, __Event } from './Event.js'

export function dispatchPasteImage(image: InternalEvents['pasteImage'][0]) {
    const file = contentFileFromBufferSource('image/png', 'image.png', image)
    const event = new __Event.ClipboardEvent('paste', {
        __proto__: null,
        clipboardData: new __DataTransfer(__DataTransferItemList.from(file)),
        bubbles: true,
        cancelable: true,
    })
    DispatchEvent($.DocumentActiveElement(), event)
}
