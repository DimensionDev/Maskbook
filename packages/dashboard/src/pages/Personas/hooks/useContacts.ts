import { useAsyncRetry, useUpdateEffect } from 'react-use'
import { Services } from '../../../API'
import type { Relation } from '@masknet/shared'
import { useRef } from 'react'
import { last } from 'lodash-es'

export const useContacts = (network: string, page: number, size = 20) => {
    const cache = useRef<Relation[]>([])

    // If the network type be changed, clean cache
    useUpdateEffect(() => {
        if (cache.current.length) cache.current = []
    }, [network])

    return useAsyncRetry(async () => {
        let relations: Relation[] = []

        // If return data exists, the cache is returned directly
        const cacheValue = cache.current.slice(page * 20, (page + 1) * 20)
        if (cacheValue.length) relations = cacheValue
        else {
            const lastValue = last(cache.current)
            const values = await Services.Identity.queryRelationPaged(
                {
                    after: lastValue ? [lastValue.linked, lastValue.profile] : undefined,
                },
                size,
            )

            // Cache each page of data
            cache.current.push(...values)
            relations = values
        }

        const targets = relations.filter((x) => x.profile.network === network).map((x) => x.profile)

        const profiles = await Services.Identity.queryProfilesWithIdentifiers(targets)

        return profiles.map((profile) => {
            const favor = relations.find((x) => x.profile.equals(profile.identifier))?.favor
            return {
                favor,
                ...profile,
            }
        })
    }, [page, size, network])
}
