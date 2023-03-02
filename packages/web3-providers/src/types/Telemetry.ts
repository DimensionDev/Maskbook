import type { NetworkPluginID, PluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'

export namespace TelemetryAPI {
    export enum GroupID {
        Event = 'event',
        Exception = 'exception',
    }

    export enum EventType {
        Access = 'Access',
        Exit = 'Exit',
        Interact = 'Interact',
    }

    export enum ExceptionType {
        Error = 'Error',
    }

    export enum EventID {
        AccessApplicationBoard = 'access_application_board',
        AccessDashboard = 'access_dashboard',
        AccessPopup = 'access_popup',
        AccessWeb3ProfileDialog = 'access_web3_profile_dialog',
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
