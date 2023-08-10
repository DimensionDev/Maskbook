import type { CompositionType } from '@masknet/plugin-infra/content-script'
import { Emitter } from '@servie/events'

export const emitter = new Emitter<{
    open: [{ compositionType: CompositionType; selectMode: boolean; selectedFiles?: string[] }]
}>()

export function openBrowser(compositionType: CompositionType) {
    emitter.emit('open', { compositionType, selectMode: false })
}

export function openPicker(selectedFiles: string[], compositionType: CompositionType) {
    emitter.emit('open', { compositionType, selectMode: true, selectedFiles })
}
