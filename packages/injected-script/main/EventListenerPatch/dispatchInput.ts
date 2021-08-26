import type { InternalEvents } from '../../shared'
import { apply, getDocumentActiveElement } from '../intrinsic'
import { clone_into } from '../utils'
import { dispatchEventRaw } from './capture'

const { InputEvent } = globalThis.window
const input_value_setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
const textarea_value_setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!
export function dispatchInput(text: InternalEvents['input'][0]) {
    // Cause react hooks the input.value getter & setter, set hooked version will notify react **not** call the onChange callback.
    const element = getDocumentActiveElement()
    try {
        apply(input_value_setter, element, [text])
    } catch {}
    try {
        apply(textarea_value_setter, element, [text])
    } catch {}
    dispatchEventRaw(element, new InputEvent('input', clone_into({ inputType: 'insertText', data: text })))
}
