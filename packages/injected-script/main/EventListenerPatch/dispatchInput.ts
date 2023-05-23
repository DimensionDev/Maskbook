import type { InternalEvents } from '../../shared/index.js'
import { $ } from '../intrinsic.js'
import { DispatchEvent, __Event } from './Event.js'

export function dispatchInput(text: InternalEvents['input'][0]) {
    // Cause react hooks the input.value getter & setter, set hooked version will notify react **not** call the onChange callback.
    const element = $.DocumentActiveElement()
    try {
        $.HTMLInputElement_value_setter(element as HTMLInputElement, text)
    } catch {}
    try {
        $.HTMLTextAreaElement_value_setter(element as HTMLTextAreaElement, text)
    } catch {}
    DispatchEvent(
        element,
        new __Event.InputEvent('input', {
            __proto__: null,
            inputType: 'insertText',
            data: text,
        }),
    )
}
