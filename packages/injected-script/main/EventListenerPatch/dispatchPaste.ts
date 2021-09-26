import type { InternalEvents } from '../../shared'
import { apply, getDocumentActiveElement, no_xray_ClipboardEvent, no_xray_DataTransfer } from '../intrinsic'

export function dispatchPaste(text: InternalEvents['paste'][0]) {
    const data = new no_xray_DataTransfer()
    const e = new no_xray_ClipboardEvent('paste', {
        clipboardData: data,
        // @ts-ignore Firefox only API
        dataType: 'text/plain',
        data: text,
        bubbles: true,
        cancelable: true,
    })
    // TODO: save intrinsic of %DataTransfer.prototype.setData%
    data.setData('text/plain', text)
    apply(dispatchEvent, getDocumentActiveElement(), [e])
}
