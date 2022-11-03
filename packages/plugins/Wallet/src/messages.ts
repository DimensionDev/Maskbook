import type BigNumber from 'bignumber.js'
import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { PluginID, NetworkPluginID } from '@masknet/shared-base'
import type { GasOptionType, NonFungibleTokenContract } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { PLUGIN_ID } from './constants.js'

export type ApplicationDialogEvent = {
    open: boolean
    settings?: {
        // When quickMode is enabled,
        // closing the Setting dialog will not return to ApplicationBoard normal dialog
        quickMode?: boolean
        switchTab?: {
            focusPluginID?: PluginID
        }
    }
}

export type SelectProviderDialogEvent =
    | {
          open: true
          walletConnectedCallback?: () => void
          supportedNetworkList?: Array<Web3Helper.NetworkDescriptorAll['type']>
          network?: Web3Helper.NetworkDescriptorAll
      }
    | {
          open: false
          address?: string
      }

export type WalletConnectQRCodeDialogEvent =
    | {
          open: true
          uri: string
      }
    | {
          open: false
      }

export type ConnectWalletDialogEvent =
    | {
          open: true
          network: Web3Helper.NetworkDescriptorAll
          provider: Web3Helper.ProviderDescriptorAll
          walletConnectedCallback?: () => void
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
    gasOption?: GasOptionType | null
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

    chainId?: ChainId
    balance?: string
    /**
     * The selected detailed nft contract.
     */
    contract?: NonFungibleTokenContract<ChainId, SchemaType>
}

export interface SocketMessageUpdatedEvent {
    id: string
    done: boolean
    error?: unknown
    from: 'cache' | 'remote'
}

export interface WalletMessage {
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
     * Application dialog
     */
    ApplicationDialogUpdated: ApplicationDialogEvent

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

    walletsUpdated: void
    phrasesUpdated: void
    addressBookUpdated: void
    transactionsUpdated: void
    requestsUpdated: {
        hasRequest: boolean
    }
    /** true: Now locked; false: Now unlocked */
    walletLockStatusUpdated: boolean
    socketMessageUpdated: SocketMessageUpdatedEvent

    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const WalletMessages: {
    events: PluginMessageEmitter<WalletMessage>
} = {
    events: createPluginMessage<WalletMessage>(PLUGIN_ID),
}
