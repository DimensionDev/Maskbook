import type { InternalEvents } from '../../shared'
import { getDocumentActiveElement, no_xray_ClipboardEvent, no_xray_DataTransfer } from '../intrinsic'
import { constructXrayUnwrappedFilesFromUintLike, constructXrayUnwrappedDataTransferProxy } from '../utils'
import { dispatchEventRaw } from './capture'

export function dispatchPasteImage(image: InternalEvents['pasteImage'][0]) {
    const data = new no_xray_DataTransfer()
    const e = new no_xray_ClipboardEvent('paste', {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
    })
    const file = constructXrayUnwrappedFilesFromUintLike('image/png', 'image.png', image)
    const dt = constructXrayUnwrappedDataTransferProxy(file)
    dispatchEventRaw(getDocumentActiveElement(), e, { clipboardData: dt })
}
