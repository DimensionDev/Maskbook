import urlcat from 'urlcat'
import { isUndefined, omitBy } from 'lodash-es'
import type { BuildInfoFile } from '@masknet/flags'
import {
    TelemetryID,
    type EnhanceableSite,
    type ExtensionSite,
    type NetworkPluginID,
    type PluginID,
    getAgentType,
    getSiteType,
    getExtensionId,
} from '@masknet/shared-base'
import type { EventID } from '../types/index.js'
import { getABTestSeed, joinsABTest } from '../entry-helpers.js'

export interface Event {
    event: EventID

    properties: {
        type: string

        // the previous event name
        previous_event?: EventID
        // the previous event ID
        previous_event_id?: string

        // ip address
        ip?: string
        // timestamp like Date.now()
        time: number
        // a unique id to make distinguish of users
        distinct_id: string
        // a unique id to make distinguish of events (uuid)
        $insert_id: string

        // screen height
        $screen_height?: number
        // screen width
        $screen_width?: number
        // a unique user id
        $user_id?: string
        // os name
        $os?: string
        // browser name
        $browser?: string
        // browser version
        $browser_version?: string
        // name of device
        $device?: string
        // a unique device id
        $device_id?: string

        // the city of the event sender parsed from the IP property or the Latitude and Longitude properties.
        $city?: string
        // the region (state or province) of the event sender parsed from the IP property or the Latitude and Longitude properties.
        $region?: string
        // timezone of the event sender, parsed from IP.
        $timezone?: string

        // network metadata
        chain_id?: number
        plugin_id?: PluginID
        network_id?: NetworkPluginID
        network?: string
        provider?: string

        // browser env
        agent?: string
        site?: EnhanceableSite | ExtensionSite
        ua?: string
        extension_id?: string

        // build env
        channel?: string
        version?: string
        branch_name?: string

        // ab-testing
        device_ab?: boolean
        device_seed?: number
        device_id?: string
    }
}

export class MixpanelEventAPI {
    private lastEvent?: Event

    constructor(
        private token: string,
        private env: BuildInfoFile,
    ) {}

    private attachEvent(event: Event): Event {
        return (this.lastEvent = {
            event: event.event,
            properties: omitBy<Event['properties']>(
                {
                    previous_event: this.lastEvent?.event,
                    previous_event_id: this.lastEvent?.properties.$insert_id,

                    $user_id: TelemetryID.value,
                    $device_id: TelemetryID.value,

                    $screen_height: screen.height,
                    $screen_width: screen.width,
                    $browser: navigator.appName,
                    $browser_version: navigator.appVersion,

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

                    ...event.properties,
                },
                isUndefined,
            ) as Event['properties'],
        })
    }

    // for collecting data on the server-slide
    // learn more at: https://developer.mixpanel.com/reference/import-events
    async importEvent(_: Event) {
        const event = this.attachEvent(_)

        const response = await fetch(
            urlcat('https://mixpanel.r2d2.to/import', {
                strict: 1,
                project_id: this.token,
            }),
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([event]),
            },
        )
        const json: {
            code: number
            error?: string
            num_records_imported?: number
            status: string
        } = await response.json()

        if (json.error) throw new Error(json.error)
    }

    // for collecting data on the client-slide
    // Learn more at: https://developer.mixpanel.com/reference/track-event
    async trackEvent(_: Event) {
        const event = this.attachEvent(_)

        const response = await fetch(
            urlcat('https://mixpanel.r2d2.to/track', {
                // in the debug mode the API returns more information
                verbose: process.env.NODE_ENV === 'development' ? 1 : 0,
            }),
            {
                method: 'POST',
                headers: {
                    // Accept: 'application/json',
                    Accept: 'text/plain',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([
                    {
                        event: event.event,
                        properties: {
                            ...event.properties,
                            token: this.token,
                        },
                    },
                ]),
            },
        )

        const json:
            | {
                  error?: string
                  status: string
              }
            | 0 = await response.json()

        if (json === 0) throw new Error('No data objects in the body are invalid.')
        if (typeof json === 'object' && json.error) throw new Error(json.error)
        return
    }
}
