import type { InternalEvents } from '../../shared'
import { $, $NoXRay } from '../intrinsic'
import { constructXrayUnwrappedFilesFromUintLike, constructXrayUnwrappedDataTransferProxy } from '../utils'
import { dispatchEventRaw } from './capture'

export function dispatchPasteImage(image: InternalEvents['pasteImage'][0]) {
    const data = new $NoXRay.DataTransfer()
    const e = new $NoXRay.ClipboardEvent('paste', {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
    })
    const file = constructXrayUnwrappedFilesFromUintLike('image/png', 'image.png', image)
    const dt = constructXrayUnwrappedDataTransferProxy(file)
    dispatchEventRaw($.DocumentActiveElement(), e, { clipboardData: dt })
}
