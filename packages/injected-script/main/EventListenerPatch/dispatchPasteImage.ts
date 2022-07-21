import type { InternalEvents } from '../../shared/index.js'
import { $, $NoXRay } from '../intrinsic.js'
import { constructXrayUnwrappedFilesFromUintLike, constructXrayUnwrappedDataTransferProxy } from '../utils.js'
import { dispatchEventRaw } from './capture.js'

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
