import { Emitter } from '@servie/events'

export const emitter = new Emitter<{ 'toggle-filter': [] }>()

export function toggleFilter() {
    emitter.emit('toggle-filter')
}
