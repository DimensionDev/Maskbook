import { useAsyncRetry, useUpdateEffect } from 'react-use'
import { Services } from '../../../API'
import type { Relation } from '@masknet/shared'
import { useRef } from 'react'
import { last } from 'lodash-es'
import { PersonaContext } from './usePersonaContext'

export const useContacts = (network: string, page: number, size = 20) => {
    const cache = useRef<Map<number, Relation | undefined>>(new Map([]))
    const { currentPersona } = PersonaContext.useContainer()

    // If the network type be changed, clean cache
    useUpdateEffect(() => {
        cache.current = new Map()
    }, [network, currentPersona])

    return useAsyncRetry(async () => {
        const lastValue = cache.current.get(page - 1)

        const values = await Services.Identity.queryRelationPaged(
            {
                network,
                after: lastValue,
            },
            size,
        )

        // Cache the last record of  each page
        cache.current.set(page, last(values))

        const profiles = await Services.Identity.queryProfilesWithIdentifiers(values.map((x) => x.profile))

        return profiles.map((profile) => {
            const favor = values.find((x) => x.profile.equals(profile.identifier))?.favor
            return {
                favor,
                ...profile,
            }
        })
    }, [page, size, network, currentPersona])
}
