import type { InternalEvents } from '../../shared/event.js'
import { $, $Content } from '../../shared/intrinsic.js'
import { cloneIntoContent } from '../utils.js'
import { dispatchMockEventBubble } from './capture.js'

export function dispatchInput(text: InternalEvents['input'][0]) {
    // Cause react hooks the input.value getter & setter, set hooked version will notify react **not** call the onChange callback.
    const element = $.Document_activeElement_getter()
    try {
        $.HTMLInputElement_value_setter(element as HTMLInputElement, text)
    } catch {}
    try {
        $.HTMLTextAreaElement_value_setter(element as HTMLTextAreaElement, text)
    } catch {}
    dispatchMockEventBubble(
        element,
        new $Content.InputEvent('input', cloneIntoContent({ inputType: 'insertText', data: text })),
    )
}
