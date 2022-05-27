import { useAsync } from 'react-use'
import { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { useERC721TokenContract } from './useERC721TokenContract'
import { useChainId } from '../useChainId'

export function useERC721TokenByIndex(
    token?: NonFungibleToken<ChainId, SchemaType.ERC721>,
    index = 0,
): AsyncState<string | undefined> {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const erc721Contract = useERC721TokenContract(chainId, token?.address)

    return useAsync(async () => {
        if (!erc721Contract) return
        return erc721Contract.methods.tokenByIndex(index).call()
    }, [chainId, erc721Contract, index])
}
