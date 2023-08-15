import { isUndefined, omitBy } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import { Flags, type BuildInfoFile } from '@masknet/flags'
import { TelemetryID } from '@masknet/shared-base'
import { BaseAPI } from './Base.js'
import type { EventOptions, ExceptionOptions, Provider } from '../types/index.js'
import { MixpanelEventAPI, type Event } from '../apis/Mixpanel.js'

export class MixpanelAPI extends BaseAPI<Event, never> implements Provider {
    constructor(private env: BuildInfoFile) {
        super(Flags.mixpanel_sample_rate)
    }

    private eventAPI = new MixpanelEventAPI(Flags.mixpanel_token, this.env)

    private createEvent(options: EventOptions): Event {
        return omitBy<Event>(
            {
                event: options.eventID,
                properties: {
                    type: options.eventType,

                    time: Date.now(),
                    distinct_id: TelemetryID.value,
                    $insert_id: uuid(),

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

    override captureEvent(options: EventOptions): void {
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

    override captureException(options: ExceptionOptions): void {
        // mixpanel is for events only
        return
    }
}
