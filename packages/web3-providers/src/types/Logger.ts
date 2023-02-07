import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export namespace LoggerAPI {
    export enum PageID {
        Index = 'Index',
        Unknown = 'Unknown',
    }

    export enum EventID {
        DashboardAccess = 'dashboard-access',
        ApplicationBoardAccess = 'application-board-access',
        PopupAccess = 'popup-access',
        PluginAccess = 'plugin-access',
        Web3ProfileDialogAccess = 'web3-profile-dialog-access',
    }

    export enum ExceptionID {
        FETCH_ERROR = 'FetchError',
    }

    export interface NetworkOptions {
        pluginID?: NetworkPluginID
        chainId?: Web3Helper.ChainIdAll
        account?: string
    }

    export interface UserOptions {
        userID?: string
    }

    export interface DeviceOptions {}

    export interface CommonOptions {
        user?: UserOptions
        device?: DeviceOptions
        network?: NetworkOptions
    }

    export interface EventOptions extends CommonOptions {
        eventID?: EventID
        previousEventID?: EventID
        pageID?: PageID
        previousPageID?: PageID
    }

    export interface ExceptionOptions extends CommonOptions {
        exceptionID?: ExceptionID
        error?: Error
    }

    export interface Provider<Event, Exception> {
        createEvent(options: EventOptions): Event
        createException(options: ExceptionOptions): Exception

        captureEvent(options: EventOptions): void
        captureException(options: ExceptionOptions): void

        captureMessage(message: string): void
    }
}
