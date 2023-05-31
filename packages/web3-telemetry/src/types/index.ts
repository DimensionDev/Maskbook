import type { NetworkPluginID, PluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export enum GroupID {
    Event = 'event',
    Exception = 'exception',
}

export enum EventType {
    Debug = 'debug',
    Access = 'access',
    Exit = 'exit',
    Interact = 'interact',
}

export enum ExceptionType {
    Error = 'Error',
}

export enum EventID {
    // Open the Web3 tabs but no persona detected
    AccessWeb3TabCreatePersonaTab = 'AccessWeb3TabCreatePersonaTab',
    // Open the Web3 tabs the NFTs tab presents
    AccessWeb3TabNFTsTab = 'AccessWeb3TabNFTsTab',
    // Open the Web3 tabs the Activities tab presents
    AccessWeb3TabActivitiesTab = 'AccessWeb3TabActivitiesTab',
    // Open the Web3 tabs the Donation tab presents
    AccessWeb3TabDonationTab = 'AccessWeb3TabDonationTab',
    // Open the Web3 tabs the Social tab presents
    AccessWeb3TabSocialTab = 'AccessWeb3TabSocialTab',
    // Open the web3 profile dialog
    AccessWeb3ProfileDialog = 'AccessWeb3ProfileDialog',
    // Open the Web3 profile dialog the NFTs tab presents
    AccessWeb3ProfileDialogNFTsTab = 'AccessWeb3ProfileDialogNFTsTab',
    // Open the Web3 profile dialog the Activities tab presents
    AccessWeb3ProfileDialogActivitiesTab = 'AccessWeb3ProfileDialogActivitiesTab',
    // Open the Web3 profile dialog the Donation tab presents
    AccessWeb3ProfileDialogDonationTab = 'AccessWeb3ProfileDialogDonationTab',
    // Open the Web3 profile dialog the Social tab presents
    AccessWeb3ProfileDialogSocialTab = 'AccessWeb3ProfileDialogSocialTab',
    // Open the trader plugin
    AccessTradePlugin = 'AccessTradePlugin',
    // Send the trader transaction successfully
    SendTraderTransactionSuccessfully = 'SendTraderTransactionSuccessfully',
    // The toolbar has successfully injected
    AccessToolbox = 'AccessToolbox',
    // Open the application board dialog
    AccessApplicationBoard = 'AccessApplicationBoard',
    // Open the dashboard page
    AccessDashboard = 'AccessDashboard',
    // Open the popups page
    AccessPopups = 'AccessPopups',
    // For debug only
    Debug = 'Debug',
}

export enum ExceptionID {
    FetchError = 'FetchError',
    Debug = 'DebugError',
}

export interface NetworkOptions {
    chainId?: Web3Helper.ChainIdAll
    pluginID?: PluginID
    networkID?: NetworkPluginID
    networkType?: Web3Helper.NetworkTypeAll
    providerType?: Web3Helper.ProviderTypeAll
}

export interface UserOptions {
    userID?: string
    account?: string
}

export interface DeviceOptions {}

export interface CommonOptions {
    user?: UserOptions
    device?: DeviceOptions
    network?: NetworkOptions
    // default to 1 (100%)
    sampleRate?: number
}
