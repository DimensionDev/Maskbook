import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { DataProvider } from '@masknet/public-api'
import { useTrendingById, useCoinInfoByAddress } from '../trending/useTrending.js'
import type { ChainId } from '@masknet/web3-shared-evm'
import { TagType } from '../types/index.js'

export function usePayloadFromTokenSearchKeyword(pluginID?: NetworkPluginID, keyword = '') {
    const regexResult = keyword.match(/([#$])(\w+)/) ?? []
    const { Others } = useWeb3State(pluginID)
    const searchedContractAddress = Others?.isValidAddress(keyword) ? keyword : ''
    const type = searchedContractAddress ? '$' : regexResult[1]

    const [_, _type, name = ''] = keyword.match(/([#$])(\w+)/) ?? []

    const trendingByIdResult = useTrendingById(searchedContractAddress, DataProvider.NFTScan)
    const { value: nonFungibleAsset } = trendingByIdResult
    const { value: fungibleAsset } = useCoinInfoByAddress(searchedContractAddress)

    const nonFungibleAssetName = nonFungibleAsset?.trending?.coin.symbol || nonFungibleAsset?.trending?.coin.name
    const isNFT = !!nonFungibleAssetName

    return {
        name: searchedContractAddress ? (isNFT ? nonFungibleAssetName : fungibleAsset?.name ?? '') : name,
        id: searchedContractAddress
            ? isNFT
                ? nonFungibleAsset?.trending?.coin.id
                : fungibleAsset?.id ?? ''
            : undefined,
        chainId: isNFT ? nonFungibleAsset.trending?.coin.chainId : (fungibleAsset?.chainId as ChainId),
        asset: isNFT ? trendingByIdResult : undefined,
        isNFT,
        searchedContractAddress: Others?.isValidAddress(keyword) ? keyword : undefined,
        type: type === '$' ? TagType.CASH : TagType.HASH,
    }
}
