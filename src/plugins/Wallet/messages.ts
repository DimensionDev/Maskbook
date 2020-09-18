import { BatchedMessageCenter } from '../../utils/messages'
import type { ERC20Token } from '../../web3/types'

type SelectERC20TokenDialogEvent =
    | {
          open: true
          tabId?: string
          address?: string
          excludeTokens?: string[]
      }
    | {
          open: false
          tabId?: string
          token?: ERC20Token
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

export const MessageCenter = new BatchedMessageCenter<MaskbookWalletMessages>(true, 'maskbook-wallet-events')
