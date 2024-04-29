import { Emitter } from '@servie/events'

export const emitter = new Emitter<{ open: [{ address?: string }] }>()

export function viewUser(address?: string) {
    emitter.emit('open', { address })
}
