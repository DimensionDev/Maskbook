import { env } from '@masknet/flags'
import { MixpanelAPI } from './Mixpanel.js'
import { SentryAPI } from './Sentry.js'
import type { CommonOptions, EventID, EventType, ExceptionID, ExceptionType } from '../entry-types.js'

/**
 * A proxy class for all telemetry providers.
 */
export class TelemetryAPI {
    private Sentry = new SentryAPI(env)
    private Mixpanel = new MixpanelAPI(env)

    captureEvent(eventType: EventType, eventID: EventID, options?: CommonOptions) {
        this.Mixpanel.captureEvent({
            eventType,
            eventID,
            ...options,
        })
    }

    captureException(
        exceptionType: ExceptionType,
        exceptionID: ExceptionID,
        error: Error,
        options?: CommonOptions,
    ): void {
        this.Sentry.captureException({
            exceptionType,
            exceptionID,
            error,
            ...options,
        })
    }
}
