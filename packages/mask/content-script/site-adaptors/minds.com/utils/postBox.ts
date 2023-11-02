import type { LiveSelector } from '@dimensiondev/holoflows-kit'
import { composerModalSelector, postEditorDraftContentSelector } from './selector.js'

export function getEditorContent() {
    const editorNode = postEditorDraftContentSelector().evaluate()
    if (!editorNode) return ''
    return (editorNode as HTMLTextAreaElement).value
}

export function isCompose() {
    return !!composerModalSelector().evaluate()
}

export function hasFocus(x: LiveSelector<HTMLElement, true>) {
    return x.evaluate() === document.activeElement
}

export function hasEditor() {
    return !!postEditorDraftContentSelector().evaluate()
}
