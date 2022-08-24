import urlcat from 'urlcat'
import { ChainId, SchemaType } from '@masknet/web3-shared-solana'
import type { NonFungibleTokenAPI } from '../../types'
import { fetchFromNFTScanV2 } from '../helpers/Solana'
import type { HubOptions } from '@masknet/web3-shared-base'
import type { Asset } from '../types/Solana'

export class NFTScanSolanaAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {}) {
        const path = urlcat('/sol/assets/:address', {
            address,
        })
        const response = await fetchFromNFTScanV2<{ data: Asset }>(chainId, path)
        if (!response?.data) return
        return createNonFungibleTokenAsset(chainId, response.data)
    }

    // async getAssets(account: string, { chainId = ChainId.Mainnet, indicator, size = 20 }: HubOptions<ChainId> = {}) {
    //     const path = urlcat('/api/v2/account/own/all/:from', {
    //         from: account,
    //         erc_type: ErcType.ERC721,
    //         show_attribute: true,
    //     })
    //     const response = await fetchFromNFTScanV2<{ data: AssetsGroup[] }>(chainId, path)
    //     const assets =
    //         response?.data?.flatMap((x) => x.assets.map((x) => createNonFungibleTokenAsset(chainId, x))) ?? EMPTY_LIST
    //     return createPageable(assets, createIndicator(indicator))
    // }
}
