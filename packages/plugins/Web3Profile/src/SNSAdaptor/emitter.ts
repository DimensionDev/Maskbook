import type { FireflyBaseAPI } from '@masknet/web3-providers/types'
import { Emitter } from '@servie/events'
import type { BadgeBounding } from './types.js'

export const emitter = new Emitter<{
    open: [{ badgeBounding: BadgeBounding; lensAccounts: FireflyBaseAPI.FireflyLensAccount[] }]
    close: []
}>()

export function openPopup(badgeBounding: BadgeBounding, lensAccounts: FireflyBaseAPI.FireflyLensAccount[]) {
    emitter.emit('open', { badgeBounding, lensAccounts })
}

export function closePopup() {
    emitter.emit('close')
}
