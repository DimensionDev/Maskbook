import type { TransactionState } from '../../web3/hooks/useTransactionState'
import type { Token } from '../../web3/types'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { PLUGIN_IDENTIFIER } from './constants'

type SelectERC20TokenDialogEvent =
    | {
          open: true
          address?: string
          lists?: string[]
          excludeTokens?: string[]
      }
    | {
          open: false
          token?: Token
      }

type SelectProviderDialogEvent =
    | {
          open: true
      }
    | {
          open: false
          address?: string
      }

type SelectWalletDialogEvent =
    | {
          open: true
      }
    | {
          open: false
      }

type WalletStatusDialogEvent = {
    open: boolean
}

type TransactionDialogEvent =
    | {
          open: true
          state: TransactionState
          shareLink?: string
          summary?: string
      }
    | {
          open: false
      }

type WalletConnectQRCodeDialogEvent =
    | {
          open: true
          uri: string
      }
    | {
          open: false
      }

interface WalletMessage {
    /**
     * Select wallet dialog
     */
    selectWalletDialogUpdated: SelectWalletDialogEvent

    /**
     * Select provider dialog
     */
    selectProviderDialogUpdated: SelectProviderDialogEvent

    /**
     * Select token dialog
     */
    selectERC20TokenDialogUpdated: SelectERC20TokenDialogEvent

    /**
     * Transaction dialog
     */
    transactionDialogUpdated: TransactionDialogEvent

    /**
     * Wallet status dialog
     */
    walletStatusDialogUpdated: WalletStatusDialogEvent

    /**
     * WalletConnect QR Code dialog
     */
    walletConnectQRCodeDialogUpdated: WalletConnectQRCodeDialogEvent
    walletsUpdated: void
    tokensUpdated: void
    rpc: unknown
}

export const WalletMessages = createPluginMessage<WalletMessage>(PLUGIN_IDENTIFIER)
export const WalletRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), WalletMessages.events.rpc)
