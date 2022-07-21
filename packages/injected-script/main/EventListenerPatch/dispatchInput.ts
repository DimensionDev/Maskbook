import type { InternalEvents } from '../../shared/index.js'
import { $, $Content } from '../intrinsic.js'
import { cloneIntoContent } from '../utils.js'
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
    dispatchEventRaw(
        element,
        new $Content.InputEvent('input', cloneIntoContent({ inputType: 'insertText', data: text })),
    )
}
