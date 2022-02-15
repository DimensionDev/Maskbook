import type { ChainId, ERC721TokenCollectionInfo, ERC721TokenDetailed } from '../types'
import { useWeb3Context } from '../context'
import { uniqWith } from 'lodash-unified'
import { isSameAddress } from '../utils'
import { useSocket } from './useSocket'

export function useCollections(address: string, chainId: ChainId | null) {
    const id = `mask.fetchNonFungibleCollectionAsset_${address}_${chainId}`
    const message = {
        id,
        method: 'mask.fetchNonFungibleCollectionAsset',
        params: {
            address: address,
            pageSize: 200,
        },
    }
    return useSocket<ERC721TokenCollectionInfo>(message)
}

export function useCollectibles(address: string, chainId: ChainId | null, dependReady?: boolean) {
    const { erc721Tokens } = useWeb3Context()
    const id = `mask.fetchNonFungibleCollectibleAsset_${address}_${chainId}`
    const message = {
        id: dependReady === undefined ? id : dependReady ? id : '',
        method: 'mask.fetchNonFungibleCollectibleAssetV2',
        params: {
            address: address,
            pageSize: 30,
        },
    }

    const { data, state, error, retry } = useSocket<ERC721TokenDetailed>(message)
    const all = uniqWith(
        [
            ...(data ?? []),
            ...erc721Tokens.getCurrentValue().filter((x) => !chainId || x.contractDetailed.chainId === chainId),
        ],
        (a, b) => isSameAddress(a.contractDetailed.address, b.contractDetailed.address) && a.tokenId === b.tokenId,
    )
    return {
        data: all as ERC721TokenDetailed[],
        state,
        error,
        retry,
    }
}
