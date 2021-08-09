import type { LiveSelector } from '@dimensiondev/holoflows-kit'
import { composerModalSelector, postEditorDraftContentSelector } from './selector'

export const getEditorContent = () => {
    const editorNode = postEditorDraftContentSelector().evaluate()
    if (!editorNode) return ''
    return (editorNode as HTMLTextAreaElement).value
}

export const isCompose = () => !!composerModalSelector().evaluate()

export const hasFocus = (x: LiveSelector<HTMLElement, true>) => x.evaluate()! === document.activeElement

export const hasEditor = () => !!postEditorDraftContentSelector().evaluate()
