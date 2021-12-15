import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../messages'

export function useNFTBalance(address: string, contractAddress?: string) {
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        if (!contractAddress) return
        return EVM_RPC.getNFTBalance(address, contractAddress, chainId)
    }, [address, contractAddress, chainId])
}
