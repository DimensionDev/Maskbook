import type { NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State, useFungibleTokenBaseOnChainIdList } from '@masknet/web3-hooks-base'
import { ChainId } from '@masknet/web3-shared-evm'
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

    return {
        name: isPreciseSearch ? fungibleToken?.symbol ?? '' : name,
        isPreciseSearch,
        type: type === '$' ? TagType.CASH : TagType.HASH,
    }
}
