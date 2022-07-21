import type { InternalEvents } from '../../shared/event.js'
import { $, $Content } from '../../shared/intrinsic.js'
import { cloneIntoContent, contentFileFromBufferSource } from '../utils.js'
import { dispatchMockEventBubble } from './capture.js'

export function dispatchPasteImage(image: InternalEvents['pasteImage'][0]) {
    const data = new $Content.DataTransfer()
    const e = new $Content.ClipboardEvent('paste', {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
    })
    const file = contentFileFromBufferSource('image/png', 'image.png', image)
    const dt = contentRealmDataTransferProxyFromFile(file)
    dispatchMockEventBubble($.Document_activeElement_getter(), e, { clipboardData: dt })
}

function contentRealmDataTransferProxyFromFile(contentRealmFile: File) {
    return new $Content.Proxy(
        new $Content.DataTransfer(),
        cloneIntoContent({
            get(target, key: keyof DataTransfer) {
                if (key === 'files') return cloneIntoContent([contentRealmFile])
                if (key === 'types') return cloneIntoContent(['Files'])
                if (key === 'items')
                    return cloneIntoContent([
                        {
                            kind: 'file',
                            type: 'image/png',
                            getAsFile() {
                                return contentRealmFile
                            },
                        },
                    ])
                if (key === 'getData') return cloneIntoContent(() => '')
                return target[key]
            },
        }),
    )
}
