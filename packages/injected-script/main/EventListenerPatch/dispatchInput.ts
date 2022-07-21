import type { InternalEvents } from '../../shared/index.js'
import { $, $NoXRay } from '../intrinsic.js'
import { clone_into } from '../utils.js'
import { dispatchEventRaw } from './capture.js'

export function dispatchInput(text: InternalEvents['input'][0]) {
    // Cause react hooks the input.value getter & setter, set hooked version will notify react **not** call the onChange callback.
    const element = $.DocumentActiveElement()
    try {
        $.HTMLInputElement_value_setter(element as HTMLInputElement, text)
    } catch {}
    try {
        $.HTMLTextAreaElement_value_setter(element as HTMLTextAreaElement, text)
    } catch {}
    dispatchEventRaw(element, new $NoXRay.InputEvent('input', clone_into({ inputType: 'insertText', data: text })))
}
