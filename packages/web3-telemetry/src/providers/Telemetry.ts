import { env } from '@masknet/flags'
import { MixpanelAPI } from './Mixpanel.js'
import type { CommonOptions, EventID, EventType, ExceptionID, ExceptionType } from '../entry-types.js'

/**
 * A proxy class for all telemetry providers.
 */
export class TelemetryAPI {
    private Mixpanel = process.env.MASK_MIXPANEL === 'enabled' ? new MixpanelAPI(env) : null

    captureEvent(eventType: EventType, eventID: EventID, options?: CommonOptions) {
        this.Mixpanel?.captureEvent({
            eventType,
            eventID,
            ...options,
        })
    }

    // no-op: exception reporting had no provider left after Sentry was removed.
    captureException(
        exceptionType: ExceptionType,
        exceptionID: ExceptionID,
        error: Error,
        options?: CommonOptions,
    ): void {}
}
