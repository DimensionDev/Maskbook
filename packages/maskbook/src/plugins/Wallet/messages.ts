import type { NetworkType, ProviderType, Wallet } from '@dimensiondev/web3-shared'
import type { FixedTokenListProps } from '../../extension/options-page/DashboardComponents/FixedTokenList'
import type { FungibleTokenDetailed } from '@dimensiondev/web3-shared'
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

export type ConnectWalletDialogEvent =
    | {
          open: true
          providerType: ProviderType
          networkType: NetworkType
      }
    | {
          open: false
      }

export type SelectWalletDialogEvent =
    | {
          open: true
          networkType: NetworkType
      }
    | {
          open: false
      }

export type CreateImportWalletDialogEvent = {
    open: boolean
}

export type CreateWalletDialogEvent = {
    name?: string
    open: boolean
}

export type ImportWalletDialogEvent = {
    name?: string
    open: boolean
}

export type WalletStatusDialogEvent = {
    open: boolean
}

export type WalletRenameDialogEvent = {
    open: boolean
    wallet: Wallet | null
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
          disableNativeToken?: boolean
          disableSearchBar?: boolean
          FixedTokenListProps?: Omit<FixedTokenListProps, 'onSubmit'>
      }
    | {
          open: false
          uuid: string

          /**
           * The selected detailed token.
           */
          token?: FungibleTokenDetailed
      }

interface WalletMessage {
    /**
     * Select wallet dialog
     */
    selectWalletDialogUpdated: SelectWalletDialogEvent

    /**
     * Create or import wallet choose dialog
     */
    createImportWalletDialogUpdated: CreateImportWalletDialogEvent

    /**
     * Create wallet dialog
     */
    createWalletDialogUpdated: CreateWalletDialogEvent

    /**
     * import wallet dialog
     */
    importWalletDialogUpdated: ImportWalletDialogEvent

    /**
     * Select provider dialog
     */
    selectProviderDialogUpdated: SelectProviderDialogEvent

    /**
     * Connect wallet dialog
     */
    connectWalletDialogUpdated: ConnectWalletDialogEvent

    /**
     * Wallet status dialog
     */
    walletStatusDialogUpdated: WalletStatusDialogEvent

    /**
     * Wallet status dialog
     */
    walletRenameDialogUpdated: WalletRenameDialogEvent

    /**
     * Select token dialog
     */
    selectTokenDialogUpdated: SelectTokenDialogEvent

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

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const WalletMessages = createPluginMessage<WalletMessage>(PLUGIN_IDENTIFIER)
export const WalletRPC = createPluginRPC(PLUGIN_IDENTIFIER, () => import('./services'), WalletMessages.events.rpc)
