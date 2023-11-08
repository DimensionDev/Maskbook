import { Emitter } from '@servie/events'

export const emitter = new Emitter<{ open: [{ address?: string }] }>()

export function openDialog() {
    emitter.emit('open', {})
}

export function viewUser(address?: string) {
    emitter.emit('open', { address })
}
