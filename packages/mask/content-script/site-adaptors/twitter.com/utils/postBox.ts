import { postEditorDraftContentSelector } from './selector.js'
import type { LiveSelector } from '@dimensiondev/holoflows-kit'

export function getEditorContent() {
    const editorNode = postEditorDraftContentSelector().evaluate()
    if (!editorNode) return ''
    if (editorNode.tagName.toLowerCase() === 'div') return (editorNode as HTMLDivElement).innerText
    return (editorNode as HTMLTextAreaElement).value
}

export function isCompose() {
    return globalThis.location.pathname === '/compose/post'
}

export function hasFocus(x: LiveSelector<HTMLElement, true>) {
    return x.evaluate() === document.activeElement
}

export function hasEditor() {
    return !!postEditorDraftContentSelector().evaluate()
}
