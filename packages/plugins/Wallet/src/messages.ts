import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import type { NetworkPluginID, Web3Plugin } from '@masknet/plugin-infra/web3'
import type {
    ChainId,
    ERC721ContractDetailed,
    GasOption,
    GasOptions,
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
          network: Web3Plugin.NetworkDescriptor<number, string>
          provider: Web3Plugin.ProviderDescriptor<number, string>
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

export type WalletRiskWarningDialogEvent =
    | {
          open: true
          account: string
          pluginID: NetworkPluginID
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
     * Gas setting dialog
     */
    gasSettingDialogUpdated: GasSettingDialogEvent

    /**
     * Select nft contract dialog
     */
    selectNftContractDialogUpdated: SelectNftContractDialogEvent

    /**
     * Wallet Risk Warning dialog
     */
    walletRiskWarningDialogUpdated: WalletRiskWarningDialogEvent

    walletsUpdated: void
    phrasesUpdated: void
    addressBookUpdated: void
    transactionsUpdated: void
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
