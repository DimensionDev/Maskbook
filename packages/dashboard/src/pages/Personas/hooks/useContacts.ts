import { useAsyncRetry, useUpdateEffect } from 'react-use'
import { Services } from '../../../API'
import type { Relation } from '@masknet/shared'
import { useRef } from 'react'
import { last } from 'lodash-es'

export const useContacts = (network: string, page: number, size = 20) => {
    const cache = useRef<Map<number, Relation | undefined>>(new Map([]))

    // If the network type be changed, clean cache
    useUpdateEffect(() => {
        cache.current = new Map()
    }, [network])

    return useAsyncRetry(async () => {
        const lastValue = cache.current.get(page - 1)

        const values = await Services.Identity.queryRelationPaged(
            {
                after: lastValue ? [lastValue.linked, lastValue.profile] : undefined,
            },
            size,
        )

        // Cache the last record of  each page
        cache.current.set(page, last(values))

        const targets = values.filter((x) => x.profile.network === network).map((x) => x.profile)

        const profiles = await Services.Identity.queryProfilesWithIdentifiers(targets)

        return profiles.map((profile) => {
            const favor = values.find((x) => x.profile.equals(profile.identifier))?.favor
            return {
                favor,
                ...profile,
            }
        })
    }, [page, size, network])
}
