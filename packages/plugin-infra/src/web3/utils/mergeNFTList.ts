import type { ERC721TokenDetailed } from '../../web3-token-types'
import { uniqWith } from 'lodash-unified'
import { isSameAddress } from './isSameAddress'

export function mergeNFTList(NFTList: ERC721TokenDetailed[]) {
    return uniqWith(
        NFTList,
        (a, b) => isSameAddress(a.contractDetailed.address, b.contractDetailed.address) && a.tokenId === b.tokenId,
    )
}
