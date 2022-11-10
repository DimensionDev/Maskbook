import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State, useFungibleTokenBaseOnChainIdList, useSchemaType } from '@masknet/web3-hooks-base'
import { DataProvider } from '@masknet/public-api'
import { useTrendingById } from '../trending/useTrending.js'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { TagType } from '../types/index.js'

export function usePayloadFromTokenSearchKeyword(pluginID?: NetworkPluginID, keyword = '') {
    const regexResult = keyword.match(/([#$])(\w+)/) ?? []
    const { Others } = useWeb3State(pluginID)
    const isPreciseSearch = Others?.isValidAddress(keyword)
    const type = isPreciseSearch ? '$' : regexResult[1]

    const [_, _type, name = ''] = keyword.match(/([#$])(\w+)/) ?? []
    const { value: fungibleToken } = useFungibleTokenBaseOnChainIdList(
        pluginID,
        Others?.isValidAddress(keyword) ? keyword : '',
        [ChainId.Mainnet],
    )

    const { value: schemaType } = useSchemaType(pluginID, Others?.isValidAddress(keyword) ? keyword : '', {
        chainId: ChainId.Mainnet,
    })

    const { value: nonFungibleAsset } = useTrendingById(
        Others?.isValidAddress(keyword) ? keyword : '',
        DataProvider.NFTScan,
    )
    const nonFungibleAssetName = nonFungibleAsset.trending?.coin.symbol || nonFungibleAsset.trending?.coin.name
    const isNFT = schemaType === SchemaType.ERC1155 || schemaType === SchemaType.ERC721 || nonFungibleAssetName
    const presetDataProviders = isNFT ? [DataProvider.NFTScan] : undefined

    return {
        name: isPreciseSearch ? (isNFT ? nonFungibleAssetName : fungibleToken?.symbol ?? '') : name,
        presetDataProviders,
        isPreciseSearch,
        type: type === '$' ? TagType.CASH : TagType.HASH,
    }
}
