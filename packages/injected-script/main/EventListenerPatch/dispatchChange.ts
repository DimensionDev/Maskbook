import type { InternalEvents } from '../../shared'
import { getDocumentActiveElement, no_xray_ClipboardEvent, no_xray_DataTransfer } from '../intrinsic'
import { constructXrayUnwrappedDataTransferProxy, constructXrayUnwrappedFilesFromUintLike } from '../utils'
import { dispatchEventRaw } from './capture'

export function dispatchChange(image: InternalEvents['change'][0]) {
    const data = new no_xray_DataTransfer()
    const e = new no_xray_ClipboardEvent('change', {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
    })

    const file = constructXrayUnwrappedFilesFromUintLike('image/png', 'image.png', image)
    const dt = constructXrayUnwrappedDataTransferProxy(file)
    dispatchEventRaw(getDocumentActiveElement(), e, { clipboardData: dt })
}
const search = () => Array.from(document.querySelectorAll('input[data-testid="fileInput"]'))
