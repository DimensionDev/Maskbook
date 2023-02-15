import { Emitter } from '@servie/events'

export const emitter = new Emitter<{
    open: []
}>()

export function openDialog() {
    emitter.emit('open')
}
