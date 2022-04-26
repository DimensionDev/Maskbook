import { useAsyncRetry, useUpdateEffect } from 'react-use'
import { Services } from '../../../API'
import type { ProfileInformation, Relation, RelationFavor } from '@masknet/shared-base'
import { useRef } from 'react'
import { last } from 'lodash-unified'
import { PersonaContext } from './usePersonaContext'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'

export interface Contacts extends ProfileInformation {
    favor: RelationFavor | undefined
    avatar: string | undefined
}
export function useContacts(network: string, page: number, size = 20): AsyncStateRetry<Contacts[]> {
    const cache = useRef<Map<number, Relation | undefined>>(new Map([]))
    const { currentPersona } = PersonaContext.useContainer()

    // If the network type be changed, clean cache
    useUpdateEffect(() => {
        cache.current = new Map()
    }, [network, currentPersona])

    return useAsyncRetry(async () => {
        const lastValue = cache.current.get(page - 1)

        const values = await Services.Identity.queryRelationPaged(
            currentPersona?.identifier,
            {
                network,
                after: lastValue,
                pageOffset: page * size,
            },
            size,
        )

        // Cache the last record of  each page
        cache.current.set(page, last(values))

        if (values.length === 0) return []

        const identifiers = values.map((x) => x.profile)
        const [avatars, profiles] = await Promise.all([
            Services.Identity.queryAvatarsDataURL(identifiers),
            Services.Identity.queryProfilesInformation(identifiers),
        ])
        return profiles.map((profile) => {
            const favor = values.find((x) => x.profile.equals(profile.identifier))?.favor
            return {
                ...profile,
                favor,
                avatar: avatars.get(profile.identifier),
            }
        })
    }, [page, size, network, currentPersona])
}
