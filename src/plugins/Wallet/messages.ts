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

type WalletConnectQRCodeEvent =
    | {
          open: true
          tabId?: string
          uri: string
      }
    | {
          open: false
          tabId?: string
      }

export interface MaskbookWalletMessages {
    /**
     * WalletConnect QR Code dialog
     */
    walletConnectQRCodeUpdated: WalletConnectQRCodeEvent

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
