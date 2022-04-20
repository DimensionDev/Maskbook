import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import type {
    ChainId,
    ERC721ContractDetailed,
    GasOption,
    GasOptions,
    NetworkType,
    ProviderType,
    TransactionState,
    Wallet,
} from '@masknet/web3-shared-evm'
import type BigNumber from 'bignumber.js'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { PLUGIN_ID } from './constants'

export type TransactionDialogEvent =
    | {
          open: true
          state: TransactionState
          shareText?: string
          summary?: string
          title?: string
      }
    | {
          open: false
      }

export type GasPriceDialogEvent = {
    open: boolean
    type?: keyof GasOptions
}

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
          networkType: NetworkType
          providerType: ProviderType
      }
    | {
          open: false
          result?: {
              account: string
              chainId: ChainId
              networkType: NetworkType
              providerType: ProviderType
          }
      }

export type SelectWalletDialogEvent =
    | {
          open: true
          networkType: NetworkType
      }
    | {
          open: false
      }

export type WalletStatusDialogEvent = {
    open: boolean
}

export type GasSettingDialogEvent = {
    open: boolean
    gasLimit: number
    minGasLimit?: number
    gasPrice?: BigNumber.Value
    maxFee?: BigNumber.Value
    priorityFee?: BigNumber.Value
    gasOption?: GasOption | null
}

export type WalletRenameDialogEvent = {
    open: boolean
    wallet: Wallet | null
}

export type WalletRiskWarningDialogEvent =
    | {
          open: true
          wallet?: Wallet
      }
    | {
          open: false
          type: 'cancel' | 'confirm'
      }

export type RestoreLegacyWalletDialogEvent = {
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

export type SelectNftContractDialogEvent = {
    open: boolean
    uuid: string

    chainId?: ChainId
    /**
     * The selected detailed nft contract.
     */
    contract?: ERC721ContractDetailed
}

export type SocketMessageUpdatedEvent = {
    id: string
    done: boolean
    error?: unknown
    from: 'cache' | 'remote'
}

export interface WalletMessage {
    /**
     * Transaction dialog
     */
    transactionDialogUpdated: TransactionDialogEvent

    /**
     * Gas price dialog
     */
    gasPriceDialogUpdated: GasPriceDialogEvent

    /**
     * Select wallet dialog
     */
    selectWalletDialogUpdated: SelectWalletDialogEvent

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
     * Gas setting dialog
     */
    gasSettingDialogUpdated: GasSettingDialogEvent

    /**
     * Select nft contract dialog
     */
    selectNftContractDialogUpdated: SelectNftContractDialogEvent

    /**
     * WalletConnect QR Code dialog
     */
    walletConnectQRCodeDialogUpdated: WalletConnectQRCodeDialogEvent

    /**
     * Wallet Risk Warning dialog
     */
    walletRiskWarningDialogUpdated: WalletRiskWarningDialogEvent

    /**
     * Restore Legacy Wallet Dialog
     */
    restoreLegacyWalletDialogUpdated: RestoreLegacyWalletDialogEvent

    walletsUpdated: void
    phrasesUpdated: void
    addressBookUpdated: void
    transactionsUpdated: void
    transactionStateUpdated: TransactionState
    transactionProgressUpdated: {
        state: TransactionState
        payload: JsonRpcPayload
    }
    requestsUpdated: { hasRequest: boolean }
    erc20TokensUpdated: void
    erc721TokensUpdated: void
    erc1155TokensUpdated: void
    /** true: Now locked; false: Now unlocked */
    walletLockStatusUpdated: boolean
    socketMessageUpdated: SocketMessageUpdatedEvent

    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const WalletMessages: { events: PluginMessageEmitter<WalletMessage> } = {
    events: createPluginMessage<WalletMessage>(PLUGIN_ID),
}
