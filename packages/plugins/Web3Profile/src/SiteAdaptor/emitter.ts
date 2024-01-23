import type { FireflyConfigAPI } from '@masknet/web3-providers/types'
import { Emitter } from '@servie/events'

interface OpenPopupOptions {
    lensAccounts: FireflyConfigAPI.LensAccount[]
    /** For lazy load lens accounts from NextID */
    userId: string
    popupAnchorEl: HTMLElement | null
}
interface ClosePopupOptions {
    popupAnchorEl: HTMLElement | null
}
export const emitter = new Emitter<{
    open: [OpenPopupOptions]
    close: [ClosePopupOptions]
}>()

export function openPopup(options: OpenPopupOptions) {
    emitter.emit('open', options)
}

export function closePopup(options: ClosePopupOptions) {
    emitter.emit('close', options)
}
