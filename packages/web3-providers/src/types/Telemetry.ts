import type {
    EventType,
    EventID,
    ExceptionType,
    ExceptionID,
    CommonOptions,
    UserOptions,
    DeviceOptions,
    NetworkOptions,
} from '@masknet/web3-telemetry/types'

export namespace TelemetryAPI {
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
