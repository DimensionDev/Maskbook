import urlcat from 'urlcat'
import { uniqBy } from 'lodash-es'
import { type SnapshotTwitterBinding } from '@masknet/web3-shared-base'
import { DSEARCH_BASE_URL } from '../DSearch/constants.js'
import { fetchFromDSearch } from '../DSearch/helpers.js'
import type { SnapshotBaseAPI } from '../entry-types.js'

export class SnapshotSearchAPI implements SnapshotBaseAPI.DataSourceProvider {
    async get(): Promise<SnapshotTwitterBinding[]> {
        const allSettled = await Promise.allSettled(
            ['/dao/spaces.json', 'dao/specific-list.json'].map(async (path) =>
                fetchFromDSearch<SnapshotTwitterBinding[]>(urlcat(DSEARCH_BASE_URL, path), {
                    mode: 'cors',
                }),
            ),
        )

        return uniqBy(
            allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : [])),
            (x) => x.spaceId + x.twitterHandler,
        )
    }
}
