import type { Currency, Platform } from './types'
import { BatchedMessageCenter } from '../../utils/messages'

export interface SettingsEvent {
    currency: Currency
    platform: Platform
    currencies: Currency[]
}

export interface ObserveCashTagEvent {
    name: string
    element: HTMLAnchorElement | null
}

interface MaskbookTraderMessages {
    /**
     * View a cash tag
     */
    cashTagObserved: ObserveCashTagEvent

    /**
     * Update settings dialog
     */
    settingsDialogUpdated: SettingsEvent
}

export const MessageCenter = new BatchedMessageCenter<MaskbookTraderMessages>(true, 'maskbook-trader-events')
