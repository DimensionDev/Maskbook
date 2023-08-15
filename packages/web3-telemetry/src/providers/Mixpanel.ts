import { isUndefined, omit, omitBy } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import { Flags, type BuildInfoFile } from '@masknet/flags'
import {
    TelemetryID,
    type NetworkPluginID,
    type PluginID,
    getExtensionId,
    getSiteType,
    getAgentType,
    type EnhanceableSite,
    type ExtensionSite,
} from '@masknet/shared-base'
import { BaseAPI } from './Base.js'
import type { EventOptions, ExceptionOptions, Provider } from '../types/index.js'
import { getABTestSeed, joinsABTest } from '../entry-helpers.js'
import { MixpanelEventAPI, type Event } from '../apis/Mixpanel.js'

export class MixpanelAPI extends BaseAPI<Event, never> implements Provider {
    private eventAPI = new MixpanelEventAPI()

    constructor(private env: BuildInfoFile) {
        super(Flags.mixpanel_sample_rate)
    }

    private createEvent(options: EventOptions): Event {
        return {
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

                agent: getAgentType(),
                site: getSiteType(),
                ua: navigator.userAgent,
                extension_id: getExtensionId(),

                channel: this.env.channel,
                version: this.env.VERSION,
                branch_name: this.env.BRANCH_NAME,

                device_ab: joinsABTest(),
                device_seed: getABTestSeed(),
                device_id: TelemetryID.value,
            },
        }
    }

    override captureEvent(options: EventOptions): void {
        if (this.status === 'off') return
        if (!Flags.sentry_enabled) return
        if (!Flags.sentry_event_enabled) return
        if (!this.shouldRecord()) return

        const event = this.createEvent(options)
        this.eventAPI.trackEvents([event])
    }

    override captureException(options: ExceptionOptions): void {
        // mixpanel is for events only
        return
    }
}
