import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID, PluginID } from '@masknet/web3-shared-base'

export namespace TelemetryAPI {
    export enum TypeID {
        Event = 'event',
        Exception = 'exception',
    }

    export enum EventID {
        ApplicationBoardAccess = 'application-board-access',
        DashboardAccess = 'dashboard-access',
        PopupAccess = 'popup-access',
        Web3ProfileDialogAccess = 'web3-profile-dialog-access',
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
        eventID: EventID
        message?: string
    }

    export interface ExceptionOptions extends CommonOptions {
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
