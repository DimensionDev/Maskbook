import { newPostEditorSelector } from './selector'
import { LiveSelector } from '@holoflows/kit'

export const postBoxInPopup = () => {
    return globalThis.location.pathname.includes('compose')
}

export const hasFocus = (x: LiveSelector<HTMLElement, true>) => x.evaluate()! === document.activeElement

export const getText = () => newPostEditorSelector().evaluate()!.innerText
