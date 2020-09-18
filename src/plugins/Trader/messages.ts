import type { Currency, DataProvider } from './types'
import { BatchedMessageCenter } from '../../utils/messages'

interface SettingsEvent {
    currency: Currency
    platform: DataProvider
    currencies: Currency[]
}

interface CashTagEvent {
    name: string
    element: HTMLAnchorElement | null
    availablePlatforms: DataProvider[]
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
