import type { ERC721TokenDetailed } from '@masknet/web3-shared-base'
import { uniqWith } from 'lodash-unified'
import { isSameAddress } from './isSameAddress'

export function mergeNFTList(NFTList: ERC721TokenDetailed[]) {
    return uniqWith(
        NFTList,
        (a, b) =>
            isSameAddress(a.contractDetailed.address, b.contractDetailed.address) &&
            Number.parseInt(a.tokenId, a.tokenId.startsWith('0x') ? 16 : 10) ===
                Number.parseInt(b.tokenId, b.tokenId.startsWith('0x') ? 16 : 10) &&
            a.contractDetailed.chainId === b.contractDetailed.chainId,
    )
}
