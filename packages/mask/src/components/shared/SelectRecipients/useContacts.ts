import { useAsyncRetry, useUpdateEffect } from 'react-use'
import type { ProfileInformation, Relation } from '@masknet/shared-base'
import { useRef } from 'react'
import { last } from 'lodash-es'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry.js'
import { useCurrentPersona } from '../../DataSource/usePersonaConnectStatus.js'
import Services from '../../../extension/service.js'

export function useContacts(network: string): AsyncStateRetry<ProfileInformation[]> {
    const cache = useRef<Map<number, Relation | undefined>>(new Map([]))
    const currentPersona = useCurrentPersona()

    // If the network type be changed, clean cache
    useUpdateEffect(() => {
        cache.current = new Map()
    }, [network, currentPersona])

    return useAsyncRetry(async () => {
        const lastValue = cache.current.get(0)

        const values = await Services.Identity.queryRelationPaged(
            currentPersona?.identifier,
            {
                network,
                after: lastValue,
                pageOffset: 0,
            },
            1000,
        )

        // Cache the last record of  each page
        cache.current.set(0, last(values))

        if (values.length === 0) return []

        const identifiers = values.map((x) => x.profile)
        const [, profiles] = await Promise.all([
            Services.Identity.queryAvatarsDataURL(identifiers),
            Services.Identity.queryProfilesInformation(identifiers),
        ])
        return profiles
    }, [network, currentPersona])
}
