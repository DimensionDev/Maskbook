import type { Profile } from '../../database'
import { ProfileIdentifier } from '../../database/type'
import Services from '../../extension/service'
// TODO: Currently using build from github:innocentiv/swr#reset-pages-build because there is a bug in SWR
// See https://github.com/zeit/swr/pull/269
// Change dependency to swr latest after this PR is merged and released
import useSWR, { useSWRPages } from 'swr'
import { last } from 'lodash-es'
import React from 'react'
import { IdentifierMap } from '../../database/IdentifierMap'

export function useSWRProfiles(query: string | undefined) {
    const queryKey = query ? 'profiles:' + query : 'profiles'
    const swr = useSWRPages<string | null, Profile[], unknown>(
        queryKey,
        ({ offset, withSWR }) => {
            const key: Parameters<typeof fetcher> = [query, offset ?? void 0]
            const _ = withSWR(
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useSWR([...key], {
                    suspense: true,
                    fetcher,
                }),
            )
            return React.createElement(React.Fragment)
        },
        (SWR) => {
            if (!SWR.data) return null
            if (SWR.data.length < 20) return null
            const offset = last(SWR.data)?.identifier
            return offset?.toText() ?? null
        },
        [query],
    )
    // HACK: https://github.com/zeit/swr/pull/269#issuecomment-619480117
    // The useSWRPages seems have race condition and return duplicated data
    const itemsMap = new IdentifierMap(new Map())
    for (const { data } of swr.pageSWRs.filter((x) => x)) {
        if (!data) continue
        for (const each of data) {
            itemsMap.set(each.identifier, each)
        }
    }
    const items = [...itemsMap.__raw_map__.values()]
    // const items = swr.pageSWRs
    //     .filter((x) => x)
    //     .reduce((x, y) => (y.data ? x.concat(y.data) : x), [] as Profile[])
    //     .filter((x) => x)
    return { ...swr, items }
}

async function fetcher(query: string | undefined, offset: string | undefined) {
    // await sleep(2000)
    const id = offset ? ProfileIdentifier.fromString(offset, ProfileIdentifier).unwrap() : void 0
    const data = await Services.Identity.queryProfilePaged({ after: id, query }, 20)
    return data
}
