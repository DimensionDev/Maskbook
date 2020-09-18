import { BatchedMessageCenter } from '../../utils/messages'
import type { ERC20Token } from '../../web3/types'

type SelectERC20TokenDialogEvent =
    | {
          open: true
          address?: string
          excludeTokens?: string[]
      }
    | {
          open: false
          token?: ERC20Token
      }

export interface MaskbookWalletMessages {
    /**
     * Select token dialog
     */
    selectERC20TokenDialogUpdated: SelectERC20TokenDialogEvent
}

export const MessageCenter = new BatchedMessageCenter<MaskbookWalletMessages>(true, 'maskbook-wallet-events')
