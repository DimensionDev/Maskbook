import { env } from '@masknet/flags'
import { MixpanelAPI } from './Mixpanel.js'
import { SentryAPI } from './Sentry.js'
import type { CommonOptions, EventID, EventType, ExceptionID, ExceptionType } from '../entry-types.js'

/**
 * A proxy class for all telemetry providers.
 */
export class TelemetryAPI {
    private Sentry = process.env.MASK_SENTRY === 'enabled' ? new SentryAPI(env) : null
    private Mixpanel = process.env.MASK_MIXPANEL === 'enabled' ? new MixpanelAPI(env) : null

    captureEvent(eventType: EventType, eventID: EventID, options?: CommonOptions) {
        this.Mixpanel?.captureEvent({
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
        this.Sentry?.captureException({
            exceptionType,
            exceptionID,
            error,
            ...options,
        })
    }
}
