import type { InternalEvents } from '../../shared/index.js'
import { $, $unsafe } from '../intrinsic.js'
import { contentFileFromBufferSource } from '../utils.js'
import { DispatchEvent, __Event } from './Event.js'

export function dispatchPasteImage(image: InternalEvents['pasteImage'][0]) {
    const file = contentFileFromBufferSource('image/png', 'image.png', image)
    const event = new __Event.ClipboardEvent('paste', {
        __proto__: null,
        clipboardData: contentRealmDataTransferProxyFromFile(file),
        bubbles: true,
        cancelable: true,
    })
    DispatchEvent($.DocumentActiveElement(), event)
}

function contentRealmDataTransferProxyFromFile(contentRealmFile: File) {
    return new $unsafe.Proxy(new $unsafe.DataTransfer(), {
        __proto__: null,
        get: $unsafe.expose((target, key: keyof DataTransfer) => {
            if (key === 'files') return $unsafe.Array_of(contentRealmFile)
            if (key === 'types') return $unsafe.Array_of('Files')
            if (key === 'items')
                return $unsafe.fromSafe([
                    {
                        kind: 'file',
                        type: 'image/png',
                        getAsFile() {
                            return contentRealmFile
                        },
                    },
                ])
            if (key === 'getData') return $unsafe.expose(() => '')
            return target[key]
        }),
    })
}
