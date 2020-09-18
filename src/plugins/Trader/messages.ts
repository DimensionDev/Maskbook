import type { Currency, DataProvider, ERC20Token } from './types'
import { BatchedMessageCenter } from '../../utils/messages'

type SelectTokenDialogEvent =
    | {
          open: true
          address?: string
          excludeTokens?: string[]
      }
    | {
          open: false
          token?: ERC20Token
      }

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
     * Select token dialog
     */
    selectTokenDialogUpdated: SelectTokenDialogEvent

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
