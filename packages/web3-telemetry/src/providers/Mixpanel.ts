import { isUndefined, omitBy } from 'lodash-es'
import { Flags, type BuildInfoFile } from '@masknet/flags'
import { TelemetryID } from '@masknet/shared-base'
import { TelemetryProvider } from './Base.js'
import type { EventOptions, ExceptionOptions } from '../types/index.js'
import { MixpanelEventAPI, type Event } from '../apis/Mixpanel.js'

export class MixpanelAPI extends TelemetryProvider {
    constructor(env: BuildInfoFile) {
        super(Flags.mixpanel_sample_rate)
        this.eventAPI = new MixpanelEventAPI(Flags.mixpanel_project_token, env)
    }
    private eventAPI

    private createEvent(options: EventOptions): Event {
        return omitBy<Event>(
            {
                event: options.eventID,
                properties: {
                    type: options.eventType,

                    time: Date.now(),
                    distinct_id: TelemetryID.value,
                    $insert_id: crypto.randomUUID(),

                    chain_id: options.network?.chainId,
                    plugin_id: options.network?.pluginID,
                    network_id: options.network?.networkID,
                    network: options.network?.networkType,
                    provider: options.network?.providerType,
                },
            },
            isUndefined,
        ) as Event
    }

    override captureEvent(options: EventOptions) {
        if (this.status === 'off') return
        if (!Flags.sentry_enabled) return
        if (!Flags.sentry_event_enabled) return
        if (!this.shouldRecord()) return

        if (process.env.NODE_ENV === 'development') {
            console.log(`[LOG EVENT]: ${JSON.stringify(options, null, 2)}`)
        } else {
            const event = this.createEvent(options)
            this.eventAPI.trackEvent(event)
        }
    }

    override captureException(options: ExceptionOptions) {
        // mixpanel is for events only
        return
    }
}
