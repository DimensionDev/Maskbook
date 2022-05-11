import { ChainId, ERC721TokenCollectionInfo, ERC721TokenDetailed } from '../types'
import { useWeb3Context } from '../context'
import { noop, uniqWith } from 'lodash-unified'
import { isSameAddress } from '../utils'
import { useSocket } from './useSocket'
import { useMemo } from 'react'

export function useCollections(address: string, chainId: ChainId | null, dependReady?: boolean) {
    const id = `mask.fetchNonFungibleCollectionAsset_${address}_${chainId}`
    const message = {
        id: dependReady === undefined ? id : dependReady ? id : '',
        method: 'mask.fetchNonFungibleCollectionAsset',
        params: {
            address,
            pageSize: 200,
            chainId,
        },
    }
    const collections = useSocket<ERC721TokenCollectionInfo>(message)
    // TODO Pass chainId to websocket, and filter from data side.
    const filtered = useMemo(() => {
        return chainId
            ? {
                  ...collections,
                  data: collections.data.filter((x) => x.chainId === chainId),
              }
            : collections
    }, [collections, chainId])
    return filtered
}

export function useCollectibles(address: string, chainId: ChainId | null, dependReady?: boolean) {
    const { erc721Tokens } = useWeb3Context()
    const id = `mask.fetchNonFungibleCollectibleAsset_${address}_${chainId}`
    const message = {
        id: dependReady === undefined ? id : dependReady ? id : '',
        method: 'mask.fetchNonFungibleCollectibleAssetV2',
        params: {
            address,
            pageSize: 30,
        },
    }

    const { data, state, error, retry } = useSocket<ERC721TokenDetailed>(message)
    const all = uniqWith(
        [
            ...(data ?? []),
            ...erc721Tokens
                .getCurrentValue()
                .filter(
                    (x) => (!chainId || x.contractDetailed.chainId === chainId) && isSameAddress(x.info.owner, address),
                ),
        ],
        (a, b) => isSameAddress(a.contractDetailed.address, b.contractDetailed.address) && a.tokenId === b.tokenId,
    )
    return {
        data: chainId === ChainId.Mainnet ? (all as ERC721TokenDetailed[]) : [],
        state,
        error: chainId === ChainId.Mainnet ? error : undefined,
        retry: chainId === ChainId.Mainnet ? retry : noop,
    }
}
