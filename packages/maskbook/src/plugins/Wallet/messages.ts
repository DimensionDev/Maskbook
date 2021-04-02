import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { PLUGIN_IDENTIFIER } from './constants'

export type SelectGasPriceDialogEvent =
    | {
          open: true
      }
    | {
          open: false
          gasPrice: string
      }

export type SelectProviderDialogEvent =
    | {
          open: true
      }
    | {
          open: false
          address?: string
      }

export type SelectWalletDialogEvent = {
    open: boolean
}

export type CreateWalletDialogEvent = {
    name?: string
    open: boolean
}

export type WalletStatusDialogEvent = {
    open: boolean
}

export type WalletConnectQRCodeDialogEvent =
    | {
          open: true
          uri: string
      }
    | {
          open: false
      }

interface WalletMessage {
    /**
     * Select gas price dialog
     */
    selectGasPriceDialogUpdated: SelectGasPriceDialogEvent
    /**
     * Select wallet dialog
     */
    selectWalletDialogUpdated: SelectWalletDialogEvent

    /**
     * Create wallet dialog
     */
    createWalletDialogUpdated: CreateWalletDialogEvent

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
    phrasesUpdated: void
    erc20TokensUpdated: void
    erc721TokensUpdated: void
    erc1155TokensUpdated: void
    rpc: unknown
}

if (module.hot) module.hot.accept()
export const WalletMessages = createPluginMessage<WalletMessage>(PLUGIN_IDENTIFIER)
export const WalletRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), WalletMessages.events.rpc)
