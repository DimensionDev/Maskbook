import type { FireflyBaseAPI } from '@masknet/web3-providers/types'
import { Emitter } from '@servie/events'
import type { BadgeBounding } from './types.js'

export const emitter = new Emitter<{
    open: [
        {
            badgeBounding: BadgeBounding
            lensAccounts: FireflyBaseAPI.LensAccount[]
            /** For lazy load lens accounts from NextID */
            userId: string
        },
    ]
    close: []
}>()

export function openPopup(badgeBounding: BadgeBounding, lensAccounts: FireflyBaseAPI.LensAccount[], userId: string) {
    emitter.emit('open', { badgeBounding, lensAccounts, userId })
}

export function closePopup() {
    emitter.emit('close')
}
