import type { InternalEvents } from '../../shared'
import { $, $NoXRay } from '../intrinsic'
import { clone_into } from '../utils'
import { dispatchEventRaw } from './capture'

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
