import { Emitter } from '@servie/events'

export const emitter = new Emitter<{
    open: [{ selectMode: boolean; selectedFiles?: string[] }]
}>()

export function openBrowser() {
    emitter.emit('open', { selectMode: false })
}

export function openPicker(selectedFiles: string[]) {
    emitter.emit('open', { selectMode: true, selectedFiles })
}
