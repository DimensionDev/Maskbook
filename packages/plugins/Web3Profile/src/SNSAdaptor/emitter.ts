import type { FireflyBaseAPI } from '@masknet/web3-providers/types'
import { Emitter } from '@servie/events'

interface OpenPopupOptions {
    lensAccounts: FireflyBaseAPI.LensAccount[]
    /** For lazy load lens accounts from NextID */
    userId: string
    popupAnchorEl: HTMLElement | null
}
export const emitter = new Emitter<{
    open: [OpenPopupOptions]
    close: []
}>()

export function openPopup(options: OpenPopupOptions) {
    emitter.emit('open', options)
}

export function closePopup() {
    emitter.emit('close')
}
