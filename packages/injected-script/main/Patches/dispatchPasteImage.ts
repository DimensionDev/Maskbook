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
    return new $unsafe.Proxy(
        new $unsafe.DataTransfer(),
        $unsafe.structuredCloneFromSafe({
            __proto__: null,
            get: (target, key: keyof DataTransfer) => {
                if (key === 'files') return $unsafe.structuredCloneFromSafe([contentRealmFile])
                if (key === 'types') return $unsafe.structuredCloneFromSafe(['Files'])
                if (key === 'items')
                    return $unsafe.structuredCloneFromSafe([
                        {
                            kind: 'file',
                            type: 'image/png',
                            getAsFile() {
                                return contentRealmFile
                            },
                        },
                    ])
                if (key === 'getData') return $unsafe.expose(() => '')
                return (target as any)[key]
            },
        }),
    )
}
