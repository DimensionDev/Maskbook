import urlcat from 'urlcat'
import { mapKeys } from 'lodash-es'
import { useAsyncRetry } from 'react-use'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'

const DSEARCH_BASE_URL = 'https://dsearch.mask.r2d2.to'

export function useNFTRedpacketCustomCollections(owner: string, chainId: ChainId) {
    return useAsyncRetry(async () => {
        const url = urlcat(DSEARCH_BASE_URL, '/nft-lucky-drop/specific-list.json')
        const result = await fetchJSON<{ [owner: string]: Array<NonFungibleCollection<ChainId, SchemaType.ERC721>> }>(
            url,
        )
        return (
            mapKeys(result, (_v, k) => k.toLowerCase())?.[owner.toLowerCase()].filter((x) => x.chainId === chainId) ??
            []
        )
    }, [owner, chainId])
}
