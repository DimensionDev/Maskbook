import { postEditorDraftSelector } from './selector'
import { LiveSelector } from '@holoflows/kit'
import { isNull } from 'lodash-es'

export const postBoxInPopup = () => {
    return globalThis.location.pathname.includes('compose')
}

export const hasFocus = (x: LiveSelector<HTMLElement, true>) => x.evaluate()! === document.activeElement

export const getText = () => postEditorDraftSelector().evaluate()!.innerText

export const hasDraftEditor = (x: HTMLElement | Document = document) => !isNull(x.querySelector('.DraftEditor-root'))
