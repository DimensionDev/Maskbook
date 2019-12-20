import { postEditorDraftSelector } from './selector'
import { LiveSelector } from '@holoflows/kit'
import { isNull } from 'lodash-es'

export const getEditorContent = () => postEditorDraftSelector().evaluate()!.innerText

export const isCompose = () => globalThis.location.pathname.includes('compose')

export const isMobile = () => globalThis.location.host.includes('mobile')

export const hasFocus = (x: LiveSelector<HTMLElement, true>) => x.evaluate()! === document.activeElement

export const hasDraftEditor = (x: HTMLElement | Document = document) =>
    !isNull(isMobile() ? x.querySelector('textarea[aria-label="Tweet text"]') : x.querySelector('.DraftEditor-root'))
