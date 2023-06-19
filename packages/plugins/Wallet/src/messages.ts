import type { BigNumber } from 'bignumber.js'
import { createPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
import type { PluginID } from '@masknet/shared-base'
import type { GasOptionType, NonFungibleCollection } from '@masknet/web3-shared-base'
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

export type GasSettingEvent = {
    open: boolean
    gasLimit: number
    minGasLimit?: number
    gasPrice?: BigNumber.Value
    maxFee?: BigNumber.Value
    priorityFee?: BigNumber.Value
    gasOption?: GasOptionType | null
}

export type SelectNftContractDialogEvent = {
    open: boolean

    chainId?: ChainId
    balance?: number
    /**
     * The selected detailed nft collection.
     */
    collection?: NonFungibleCollection<ChainId, SchemaType>
}

export interface WalletMessage {
    /**
     * Application dialog
     */
    applicationDialogUpdated: ApplicationDialogEvent

    /**
     * Gas setting dialog
     */
    gasSettingUpdated: GasSettingEvent

    /**
     * Select nft contract dialog
     */
    selectNftContractDialogUpdated: SelectNftContractDialogEvent

    walletsUpdated: void
    requestsUpdated: {
        hasRequest: boolean
    }
    /** true: Now locked; false: Now unlocked */
    walletLockStatusUpdated: boolean

    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const WalletMessages: {
    events: PluginMessageEmitter<WalletMessage>
} = {
    events: createPluginMessage<WalletMessage>(PLUGIN_ID),
}
