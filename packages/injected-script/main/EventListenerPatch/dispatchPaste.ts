import type { InternalEvents } from '../../shared/event.js'
import { $, $Content } from '../../shared/intrinsic.js'

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
    $.DataTransferSetData(data, 'text/plain', text)
    $Content.dispatchEvent($.Document_activeElement_getter()!, e)
}
