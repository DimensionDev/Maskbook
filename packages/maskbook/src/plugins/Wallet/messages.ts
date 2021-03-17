import type { FixedTokenListProps } from '../../extension/options-page/DashboardComponents/FixedTokenList'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../web3/types'
import { createPluginMessage } from '../utils/createPluginMessage'
import { createPluginRPC } from '../utils/createPluginRPC'
import { PLUGIN_IDENTIFIER } from './constants'

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

export type SelectTokenDialogEvent =
    | {
          open: true
          uuid: string
          disableEther?: boolean
          disableSearchBar?: boolean
          FixedTokenListProps?: Omit<FixedTokenListProps, 'onSubmit'>
      }
    | {
          open: false
          uuid: string

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
     * Select token dialog
     */
    selectTokenDialogUpdated: SelectTokenDialogEvent

    /**
     * WalletConnect QR Code dialog
     */
    walletConnectQRCodeDialogUpdated: WalletConnectQRCodeDialogEvent

    walletsUpdated: void
    erc20TokensUpdated: void
    erc721TokensUpdated: void
    rpc: unknown
}

if (module.hot) module.hot.accept()
export const WalletMessages = createPluginMessage<WalletMessage>(PLUGIN_IDENTIFIER)
export const WalletRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), WalletMessages.events.rpc)
