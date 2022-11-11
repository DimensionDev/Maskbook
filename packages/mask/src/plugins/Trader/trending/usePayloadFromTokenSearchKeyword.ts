import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { DataProvider } from '@masknet/public-api'
import { useTrendingById, useCoinIdByAddress } from '../trending/useTrending.js'
import { ChainId } from '@masknet/web3-shared-evm'
import { TagType } from '../types/index.js'

export function usePayloadFromTokenSearchKeyword(pluginID?: NetworkPluginID, keyword = '') {
    const regexResult = keyword.match(/([#$])(\w+)/) ?? []
    const { Others } = useWeb3State(pluginID)
    const isPreciseSearch = Others?.isValidAddress(keyword)
    const type = isPreciseSearch ? '$' : regexResult[1]

    const [_, _type, name = ''] = keyword.match(/([#$])(\w+)/) ?? []

    const { value: nonFungibleAsset } = useTrendingById(
        Others?.isValidAddress(keyword) ? keyword : '',
        DataProvider.NFTScan,
    )
    const { value: fungibleAsset } = useCoinIdByAddress(Others?.isValidAddress(keyword) ? keyword : '', [
        ChainId.Mainnet,
        ChainId.BSC,
        ChainId.Matic,
    ])

    const nonFungibleAssetName = nonFungibleAsset.trending?.coin.symbol || nonFungibleAsset.trending?.coin.name
    const isNFT = !!nonFungibleAssetName
    const presetDataProviders = isNFT ? [DataProvider.NFTScan] : undefined

    return {
        name: isPreciseSearch ? (isNFT ? nonFungibleAssetName : fungibleAsset?.coinId ?? '') : name,
        chainId: isNFT ? nonFungibleAsset.trending?.coin.chainId : (fungibleAsset?.chainId as ChainId),
        presetDataProviders,
        tokenAddress: Others?.isValidAddress(keyword) ? keyword : undefined,
        isPreciseSearch,
        type: type === '$' ? TagType.CASH : TagType.HASH,
    }
}
