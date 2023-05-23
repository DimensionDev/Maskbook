import type { InternalEvents } from '../../shared/index.js'
import { $, $Content } from '../intrinsic.js'
import { cloneIntoContent } from '../utils.js'
import { DispatchEvent, __Event } from './Event.js'

export function dispatchPaste(text: InternalEvents['paste'][0]) {
    const e = new __Event.ClipboardEvent('paste', {
        __proto__: null,
        clipboardData: contentRealmDataTransferProxyFromText(text),
        bubbles: true,
        cancelable: true,
    })
    DispatchEvent($.DocumentActiveElement(), e)
}

function contentRealmDataTransferProxyFromText(text: string) {
    return new $Content.Proxy(
        new $Content.DataTransfer(),
        cloneIntoContent({
            get(target, key: keyof DataTransfer) {
                if (key === 'getData') return cloneIntoContent(() => text)
                return target[key]
            },
        }),
    )
}
