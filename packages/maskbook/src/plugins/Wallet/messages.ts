import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../web3/types'
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

type SelectERC20TOkenDialogEvent =
    | {
          open: true

          /**
           * Specific an array of detailed tokens that must be included in the final token list.
           */
          tokens?: (EtherTokenDetailed | ERC20TokenDetailed)[]

          /**
           *  Specific an array of token that only be included in the final token list.
           */
          whitelist?: string[]

          /**
           * Specific an array of token that must be excluded in the final token list.
           */
          backlist?: string[]

          /**
           * Specific an array of token address that selected in the final token list.
           */
          selectedTokens?: string[]

          disableSearchBar?: boolean
      }
    | {
          open: false

          /**
           * The selected detailed token.
           */
          token?: EtherTokenDetailed | ERC20TokenDetailed
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
     * Select ERC20 token dialog
     */
    selectERC20TokenDialogUpdated: SelectERC20TOkenDialogEvent

    /**
     * WalletConnect QR Code dialog
     */
    walletConnectQRCodeDialogUpdated: WalletConnectQRCodeDialogEvent

    walletsUpdated: void
    tokensUpdated: void
    rpc: unknown
}

if (module.hot) module.hot.accept()
export const WalletMessages = createPluginMessage<WalletMessage>(PLUGIN_IDENTIFIER)
export const WalletRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), WalletMessages.events.rpc)
