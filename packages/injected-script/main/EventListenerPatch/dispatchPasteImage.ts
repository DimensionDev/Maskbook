import type { InternalEvents } from '../../shared/index.js'
import { $, $Content } from '../intrinsic.js'
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
    return new $Content.Proxy(
        new $Content.DataTransfer(),
        $.cloneIntoContent({
            __proto__: null,
            get(target, key: keyof DataTransfer) {
                if (key === 'files') return $.cloneIntoContent([contentRealmFile])
                if (key === 'types') return $.cloneIntoContent(['Files'])
                if (key === 'items')
                    return $.cloneIntoContent([
                        {
                            kind: 'file',
                            type: 'image/png',
                            getAsFile() {
                                return contentRealmFile
                            },
                        },
                    ])
                if (key === 'getData') return $.cloneIntoContent(() => '')
                return target[key]
            },
        }),
    )
}
