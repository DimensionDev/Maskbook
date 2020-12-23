import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { PLUGIN_IDENTIFIER } from './constants'

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
