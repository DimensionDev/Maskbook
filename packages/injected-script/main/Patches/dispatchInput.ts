import type { InternalEvents } from '../../shared/index.js'
import { $ } from '../intrinsic.js'
import { DispatchEvent, __Event } from './Event.js'

export function dispatchInput(text: InternalEvents['input'][0]) {
    const element = $.DocumentActiveElement()
    if (!element) return
    const name = $.Node_nodeName(element)

    if (name === 'INPUT') $.HTMLInputElement_value_setter(element as HTMLInputElement, text)
    else if (name === 'TEXTAREA') $.HTMLTextAreaElement_value_setter(element as HTMLTextAreaElement, text)
    const event = new __Event.InputEvent('input', {
        __proto__: null,
        inputType: 'insertText',
        data: text,
        bubbles: true,
        cancelable: true,
    })
    DispatchEvent(element, event)
}
