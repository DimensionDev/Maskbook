import { useAsyncRetry } from 'react-use'
import { NonFungibleAssetProvider, useChainId } from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../messages'

export function useNFTBalance(address: string, disabled = false) {
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        if (!address || disabled) return null
        return EVM_RPC.getNFTBalance({ address, chainId, provider: NonFungibleAssetProvider.NFTSCAN })
    }, [address, disabled, chainId])
}
