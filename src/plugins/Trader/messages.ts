import type { Currency, Platform } from './types'
import { BatchedMessageCenter } from '../../utils/messages'

interface SettingsEvent {
    currency: Currency
    platform: Platform
    currencies: Currency[]
}

interface CashTagEvent {
    name: string
    element: HTMLAnchorElement | null
    availablePlatforms: Platform[]
}

interface MaskbookTraderMessages {
    /**
     * View a cash tag
     */
    cashTagObserved: CashTagEvent

    /**
     * Update settings dialog
     */
    settingsUpdated: SettingsEvent
}

export const MessageCenter = new BatchedMessageCenter<MaskbookTraderMessages>(true, 'maskbook-trader-events')
