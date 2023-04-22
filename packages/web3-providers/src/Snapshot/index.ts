import urlcat from 'urlcat'
import { uniqBy } from 'lodash-es'
import { type DAOResult, SearchResultType } from '@masknet/web3-shared-base'
import { DSEARCH_BASE_URL } from '../DSearch/constants.js'
import { fetchFromDSearch } from '../DSearch/helpers.js'
import type { SnapshotBaseAPI } from '../entry-types.js'
import type { ChainId } from '@masknet/web3-shared-evm'

export class SnapshotSearchAPI implements SnapshotBaseAPI.DataSourceProvider {
    async get(): Promise<Array<DAOResult<ChainId.Mainnet>>> {
        const allSettled = await Promise.allSettled(
            ['dao/spaces.json', 'dao/specific-list.json'].map(async (path) =>
                fetchFromDSearch<Array<DAOResult<ChainId.Mainnet>>>(urlcat(DSEARCH_BASE_URL, path), {
                    mode: 'cors',
                }),
            ),
        )

        return uniqBy(
            allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : [])),
            (x) => x.spaceId + x.twitterHandler,
        ).map((x) => ({
            ...x,
            type: SearchResultType.DAO,
            keyword: x.twitterHandler,
            avatar: `https://cdn.stamp.fyi/space/${x.spaceId}?s=164`,
        }))
    }
}
