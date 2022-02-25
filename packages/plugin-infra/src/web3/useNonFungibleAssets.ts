import type { ERC721TokenDetailed } from '@masknet/web3-shared-base'
import type { Web3Plugin } from '../web3-types'
import { useSocket } from '../hooks/useSocket'
import { isSameAddress } from './utils/isSameAddress'
import { uniqWith } from 'lodash-unified'

export function useNonFungibleAssets(
    address: string,
    network?: Web3Plugin.NetworkDescriptor | null,
    dependReady?: boolean,
) {
    const id = `mask.fetchNonFungibleCollectibleAssetV2_${address}_${network?.ID ?? 'all'}`
    const message = {
        id: dependReady === undefined ? id : dependReady ? id : '',
        method: 'mask.fetchNonFungibleCollectibleAssetV2',
        params: {
            address,
            size: 200,
            network,
        },
    }

    const result = useSocket<ERC721TokenDetailed>(message)
    const data = uniqWith(
        result.data,
        (a, b) =>
            isSameAddress(a.contractDetailed.address, b.contractDetailed.address) &&
            a.contractDetailed.chainId === b.contractDetailed.chainId &&
            Number.parseInt(a.tokenId, a.tokenId.startsWith('0x') ? 16 : 10) ===
                Number.parseInt(b.tokenId, b.tokenId.startsWith('0x') ? 16 : 10),
    )
    return { ...result, data }
}
