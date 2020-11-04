import { postEditorDraftContentSelector } from './selector'
import type { LiveSelector } from '@dimensiondev/holoflows-kit'

export const getEditorContent = () => {
    const editorNode = postEditorDraftContentSelector().evaluate()
    if (!editorNode) return ''
    if (editorNode.tagName.toLowerCase() === 'div') return (editorNode as HTMLDivElement).innerText
    return (editorNode as HTMLTextAreaElement).value
}

export const isMobile = () => globalThis.location.host.includes('mobile')

export const isCompose = () => globalThis.location.pathname.includes('compose')

export const hasFocus = (x: LiveSelector<HTMLElement, true>) => x.evaluate()! === document.activeElement

export const hasEditor = () => !!postEditorDraftContentSelector().evaluate()
