import { Emitter } from '@servie/events'
import type { BadgeBounding } from './types.js'
import type { LensAccount } from '@masknet/web3-providers'

export const emitter = new Emitter<{
    open: [{ badgeBounding: BadgeBounding; lensAccounts: LensAccount[] }]
    close: []
}>()

export function openPopup(badgeBounding: BadgeBounding, lensAccounts: LensAccount[]) {
    emitter.emit('open', { badgeBounding, lensAccounts })
}

export function closePopup() {
    emitter.emit('close')
}
