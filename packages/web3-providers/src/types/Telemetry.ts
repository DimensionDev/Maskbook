import type { NetworkPluginID, PluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export namespace TelemetryAPI {
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
        AccessWeb3ProfileDialog = 'access_web3_profile_dialog',
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
        AccessToolbox = 'access_toolbox',
        // Open the application board dialog
        AccessApplicationBoard = 'access_application_board',
        // Open the dashboard page
        AccessDashboard = 'access_dashboard',
        // Open the popups page
        AccessPopups = 'access_popups',
        // For debug only
        Debug = 'debug',
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
    }

    export interface EventOptions extends CommonOptions {
        eventType: EventType
        eventID: EventID
        message?: string
    }

    export interface ExceptionOptions extends CommonOptions {
        exceptionType: ExceptionType
        exceptionID: ExceptionID
        error: Error
    }

    export interface Provider<Event, Exception> {
        user?: UserOptions
        device?: DeviceOptions
        network?: NetworkOptions

        enable(): void
        disable(): void

        captureEvent(options: EventOptions): void
        captureException(options: ExceptionOptions): void
    }
}
