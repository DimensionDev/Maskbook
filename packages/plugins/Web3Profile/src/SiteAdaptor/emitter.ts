import type { FireflyConfigAPI } from '@masknet/web3-providers/types'
import { Emitter } from '@servie/events'

interface OpenPopupOptions {
    lensAccounts: FireflyConfigAPI.LensAccount[]
    farcasterAccounts: FireflyConfigAPI.FarcasterProfile[]
    /** For lazy load lens accounts from NextID */
    userId: string
    popupAnchorEl: HTMLElement | null
}
interface ClosePopupOptions {
    popupAnchorEl: HTMLElement | null
}
interface OpenFarcasterPopupOptions {
    accounts: FireflyConfigAPI.FarcasterProfile[]
    /** For lazy load lens accounts from NextID */
    userId: string
    popupAnchorEl: HTMLElement | null
}
interface CloseFarcasterPopupOptions {
    popupAnchorEl: HTMLElement | null
}
export const emitter = new Emitter<{
    open: [OpenPopupOptions]
    close: [ClosePopupOptions]
    'open-farcaster': [OpenFarcasterPopupOptions]
    'close-farcaster': [CloseFarcasterPopupOptions]
}>()

export function openPopup(options: OpenPopupOptions) {
    emitter.emit('open', options)
}

export function closePopup(options: ClosePopupOptions) {
    emitter.emit('close', options)
}
