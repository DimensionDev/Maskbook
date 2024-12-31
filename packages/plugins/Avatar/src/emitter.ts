import { Emitter } from '@servie/events'

export const emitter = new Emitter<{
    add: []
}>()

export function addCollectibles() {
    emitter.emit('add')
}
