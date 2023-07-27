import { NetworkPluginID } from '@masknet/shared-base'
import { useChainId } from '@masknet/web3-hooks-base'
import { getNativeTokenAddress, type ChainId } from '@masknet/web3-shared-evm'
import { useSearchParams } from 'react-router-dom'

export function useTokenParams() {
    const [params, setParams] = useSearchParams()
    const defaultChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const rawChainId = params.get('chainId')
    const chainId: ChainId = rawChainId ? Number.parseInt(rawChainId, 10) : defaultChainId
    const rawAddress = params.get('address')
    const address = rawAddress || getNativeTokenAddress(chainId)

    return { chainId, address, rawChainId, rawAddress, params, setParams }
}

/**
 * No fallback for non-fungible token
 */
export function useNonFungibleTokenParams() {
    const [params, setParams] = useSearchParams()
    const defaultChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const rawChainId = params.get('nft:chainId')
    const chainId: ChainId = rawChainId ? Number.parseInt(rawChainId, 10) : defaultChainId
    const address = params.get('nft:address')
    const tokenId = params.get('nft:tokenId')

    return { chainId, address, tokenId, params, setParams }
}
