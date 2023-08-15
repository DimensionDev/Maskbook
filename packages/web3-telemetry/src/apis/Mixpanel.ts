import urlcat from 'urlcat'
import type { EnhanceableSite, ExtensionSite, NetworkPluginID, PluginID } from '@masknet/shared-base'
import type { EventID } from '../types/index.js'

const PROJECT_TOKEN = 'b815b822fd131650e92ff8539eb5e793'

export interface Event {
    event: EventID

    properties: {
        type: string

        // timestamp like Date.now()
        time: number
        // a unique id to make distinguish of users
        distinct_id: string
        // a unique id to make distinguish of events (uuid)
        $insert_id: string

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
}

export class MixpanelEventAPI {
    // for collecting data on the server-slide
    // learn more at: https://developer.mixpanel.com/reference/import-events
    async importEvents(events: Event[]) {
        const response = await fetch(
            urlcat('https://api.mixpanel.com/import', { strict: 1, project_id: PROJECT_TOKEN }),
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(events),
            },
        )
        const json: {
            code: number
            error?: string
            num_records_imported?: number
            status: string
        } = await response.json()

        if (json.error) throw new Error(json.error)
        return json.num_records_imported!
    }

    // for collecting data on the client-slide
    // Learn more at: https://developer.mixpanel.com/reference/track-event
    async trackEvents(events: Event[]) {
        const response = await fetch(urlcat('https://api.mixpanel.com/track', { ip: 1, verbose: 0, img: 1 }), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                events.map((x) => ({
                    token: PROJECT_TOKEN,
                    ...x,
                })),
            ),
        })

        if (response.status !== 200) {
            const json: {
                error: string
                status: string
            } = await response.json()

            throw new Error(json.error)
        }

        return
    }
}
