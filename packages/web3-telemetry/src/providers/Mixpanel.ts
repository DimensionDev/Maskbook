import urlcat from 'urlcat'
import { isUndefined, omit, omitBy } from 'lodash-es'
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
import type { EventID, EventOptions, ExceptionOptions, Provider } from '../types/index.js'
import { telemetrySettings } from '../settings/index.js'
import { getABTestSeed, joinsABTest } from '../entry-helpers.js'

interface Event {
    ID: EventID
    type: string

    // network metadata
    chain_id?: number
    plugin_id?: PluginID
    network_id?: NetworkPluginID
    network?: string
    provider?: string

    // browser env
    agent: string
    site?: EnhanceableSite | ExtensionSite
    ua?: string
    extension_id?: string

    // build env
    channel?: string
    version?: string
    branch_name?: string

    // ab-testing
    device_ab: boolean
    device_seed: number
    device_id: string
}

export class MixpanelAPI extends BaseAPI<Event, never> implements Provider {
    constructor(private env: BuildInfoFile) {
        super(Flags.mixpanel_sample_rate)
    }

    private createEvent(options: EventOptions) {
        return omitBy<Event>(
            {
                ID: options.eventID,
                type: options.eventType,
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
            isUndefined,
        ) as unknown as Event
    }

    override captureEvent(options: EventOptions): void {
        if (this.status === 'off') return
        if (!Flags.sentry_enabled) return
        if (!Flags.sentry_event_enabled) return
        if (!this.shouldRecord()) return

        const event = this.createEvent(options)
        track(event.ID, omit(event, 'ID'))
    }

    override captureException(options: ExceptionOptions): void {
        // mixpanel is for events only
        return
    }
}
