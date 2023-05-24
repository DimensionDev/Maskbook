import type { InternalEvents } from '../../shared/index.js'
import { $, $unsafe } from '../intrinsic.js'
import { DispatchEvent, __Event } from './Event.js'

export function dispatchPaste(text: InternalEvents['paste'][0]) {
    const event = new __Event.ClipboardEvent('paste', {
        __proto__: null,
        clipboardData: contentRealmDataTransferProxyFromText(text),
        bubbles: true,
        cancelable: true,
    })
    DispatchEvent($.DocumentActiveElement(), event)
}

function contentRealmDataTransferProxyFromText(text: string) {
    return new $unsafe.Proxy(
        new $unsafe.DataTransfer(),
        $.cloneIntoContent({
            __proto__: null,
            get(target, key: keyof DataTransfer) {
                if (key === 'getData') return $.cloneIntoContent(() => text)
                return target[key]
            },
        }),
    )
}
