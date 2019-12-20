import { postEditorDraftSelector } from './selector'
import { LiveSelector } from '@holoflows/kit'
import { isNull } from 'lodash-es'

export const getEditorContent = () => {
    const editorNode = postEditorDraftSelector().evaluate()
    if (!editorNode) return ''
    if (editorNode.tagName.toLowerCase() === 'div') return (editorNode as HTMLDivElement).innerHTML
    return (editorNode as HTMLTextAreaElement).value
}

export const isMobile = () => globalThis.location.host.includes('mobile')

export const isCompose = () => globalThis.location.pathname.includes('compose')

export const hasFocus = (x: LiveSelector<HTMLElement, true>) => x.evaluate()! === document.activeElement

export const hasDraftEditor = (x: HTMLElement | Document = document) => !isNull(postEditorDraftSelector())
