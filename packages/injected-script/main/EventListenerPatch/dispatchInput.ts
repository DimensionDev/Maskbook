import type { InternalEvents } from '../../shared/index.js'
import { $, $Blessed } from '../intrinsic.js'
import { DispatchEvent, __Event, type ActivationBehavior } from './Event.js'

export function dispatchInput(text: InternalEvents['input'][0]) {
    const element = $.DocumentActiveElement()
    if (!element) return
    const name = $.Node_nodeName(element)

    const event = new __Event.InputEvent('input', {
        __proto__: null,
        inputType: 'insertText',
        data: text,
        bubbles: true,
        cancelable: true,
    })
    const activation: ActivationBehavior = $Blessed.Map()
    activation.set(element, (event) => {
        if (!event.isTrusted) return

        if (name === 'INPUT') $.HTMLInputElement_value_setter(element as HTMLInputElement, text)
        else if (name === 'TEXTAREA') $.HTMLTextAreaElement_value_setter(element as HTMLTextAreaElement, text)
    })
    DispatchEvent(element, event, activation)
}
