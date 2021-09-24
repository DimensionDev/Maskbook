import { CustomEventId, EventItemBeforeSerialization } from '../../shared'
import { instagramUpload } from './instagramUpload'
import { apply, getCustomEventDetail, warn } from '../intrinsic'
import { dispatchInput } from './dispatchInput'
import { dispatchPaste } from './dispatchPaste'
import { dispatchPasteImage } from './dispatchPasteImage'
import { hookInputUploadOnce } from './hookInputUploadOnce'

const { parse } = JSON
document.addEventListener(CustomEventId, (e) => {
    const result: EventItemBeforeSerialization = parse(getCustomEventDetail(e as CustomEvent))
    // Do not use deconstruct syntax. Avoid invoking @@iterator on Array.
    const f = result[0]
    const param = result[1] as any

    if (param.length < 1) return

    if (f === 'input') return apply(dispatchInput, null, param)
    if (f === 'paste') return apply(dispatchPaste, null, param)
    if (f === 'instagramUpload') return apply(instagramUpload, null, param)
    if (f === 'pasteImage') return apply(dispatchPasteImage, null, param)
    if (f === 'hookInputUploadOnce') return apply(hookInputUploadOnce, null, param)

    const neverEvent: never = f
    warn('[@masknet/injected-script]', neverEvent, 'not handled')
})
