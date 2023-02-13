import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export namespace LoggerAPI {
    export enum PageID {
        Index = 'Index',
        Unknown = 'Unknown',
    }

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
        pluginID?: NetworkPluginID
        chainId?: Web3Helper.ChainIdAll
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
        pageID?: PageID
        eventID: EventID
        message?: string
    }

    export interface ExceptionOptions extends CommonOptions {
        pageID?: PageID
        exceptionID: ExceptionID
        error: Error
    }

    export interface Provider<Event, Exception> {
        createEvent(options: EventOptions): Event
        createException(options: ExceptionOptions): Exception

        captureEvent(options: EventOptions): void
        captureException(options: ExceptionOptions): void
    }
}
