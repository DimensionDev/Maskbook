import { env } from '@masknet/flags'
import { BaseAPI } from './Base.js'
import { MixpanelAPI } from './Mixpanel.js'
import { SentryAPI } from './Sentry.js'
import type { EventOptions, ExceptionOptions } from '../entry-types.js'

/**
 * A proxy class for all telemetry providers.
 */
export class TelemetryAPI extends BaseAPI<unknown, unknown> {
    private Sentry = new SentryAPI(env)
    private Mixpanel = new MixpanelAPI(env)

    override captureEvent(options: EventOptions) {
        this.Mixpanel.captureEvent(options)
    }

    override captureException(options: ExceptionOptions): void {
        this.Sentry.captureException(options)
    }
}
