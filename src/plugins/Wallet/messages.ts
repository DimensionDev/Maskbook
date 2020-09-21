import { BatchedMessageCenter } from '../../utils/messages'
import type { Token } from '../../web3/types'

type SelectERC20TokenDialogEvent =
    | {
          open: true
          tabId?: string
          address?: string
          lists?: string[]
          excludeTokens?: string[]
      }
    | {
          open: false
          tabId?: string
          token?: Token
      }

type SelectProviderDialogEvent =
    | {
          open: true
          tabId?: string
      }
    | {
          open: false
          tabId?: string
          address?: string
      }

export interface MaskbookWalletMessages {
    /**
     * Select provider dialog
     */
    selectProviderDialogUpdated: SelectProviderDialogEvent

    /**
     * Select token dialog
     */
    selectERC20TokenDialogUpdated: SelectERC20TokenDialogEvent
}

export const WalletMessageCenter = new BatchedMessageCenter<MaskbookWalletMessages>(true, 'maskbook-wallet-events')
