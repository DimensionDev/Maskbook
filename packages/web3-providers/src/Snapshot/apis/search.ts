import urlcat from 'urlcat'
import { uniqBy } from 'lodash-es'
import { type DAOResult, SearchResultType } from '@masknet/web3-shared-base'
import { DSEARCH_BASE_URL } from '../../DSearch/constants.js'
import { fetchFromDSearch } from '../../DSearch/helpers.js'
import type { ChainId } from '@masknet/web3-shared-evm'

export class SnapshotSearch {
    static async get(): Promise<Array<DAOResult<ChainId.Mainnet>>> {
        const results = await fetchFromDSearch<Array<DAOResult<ChainId.Mainnet>>>(
            urlcat(DSEARCH_BASE_URL, 'dao/spaces.json'),
            {
                mode: 'cors',
            },
        )

        const resultsFromSpecificList = await fetchFromDSearch<Array<DAOResult<ChainId.Mainnet>>>(
            urlcat(DSEARCH_BASE_URL, 'dao/specific-list.json'),
            {
                mode: 'cors',
            },
        )

        const filteredResults = results.filter(
            (x) => !resultsFromSpecificList.map((y) => y.spaceId.toLowerCase()).includes(x.spaceId.toLowerCase()),
        )

        return uniqBy(
            resultsFromSpecificList.concat(filteredResults).sort((a, b) => b.followersCount - a.followersCount),
            (x) => x.spaceId + x.twitterHandler,
        ).map((x) => ({
            ...x,
            type: SearchResultType.DAO,
            keyword: x.twitterHandler,
            avatar: `https://cdn.stamp.fyi/space/${x.spaceId}?s=164`,
        }))
    }
}
