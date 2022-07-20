import type { InternalEvents } from '../../shared'
import { $, $NoXRay } from '../intrinsic'

export function dispatchPaste(text: InternalEvents['paste'][0]) {
    const data = new $NoXRay.DataTransfer()
    const e = new $NoXRay.ClipboardEvent('paste', {
        clipboardData: data,
        // @ts-ignore Firefox only API
        dataType: 'text/plain',
        data: text,
        bubbles: true,
        cancelable: true,
    })
    $.DataTransfer_setData(data, 'text/plain', text)
    $NoXRay.dispatchEvent($.DocumentActiveElement()!, e)
}
