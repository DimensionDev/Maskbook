import type { InternalEvents } from '../../shared/index.js'
import { $, $Content } from '../intrinsic.js'

export function dispatchPaste(text: InternalEvents['paste'][0]) {
    const data = new $Content.DataTransfer()
    const e = new $Content.ClipboardEvent('paste', {
        clipboardData: data,
        // @ts-ignore Firefox only API
        dataType: 'text/plain',
        data: text,
        bubbles: true,
        cancelable: true,
    })
    $.DataTransfer_setData(data, 'text/plain', text)
    $Content.dispatchEvent($.DocumentActiveElement()!, e)
}
