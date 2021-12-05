import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../messages'

export function useNFTBalance(address: string, contract_address?: string) {
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        if (!contract_address) return
        return EVM_RPC.getNFTBalance(address, contract_address, chainId)
    }, [address, contract_address, chainId])
}
