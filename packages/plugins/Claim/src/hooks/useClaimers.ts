import { AirDrop } from '@masknet/web3-providers'
import { type ChainId } from '@masknet/web3-shared-evm'
import { useAsync } from 'react-use'

// TODO: Multi-chain support
export function useClaimers(chainId: ChainId) {
    return useAsync(async () => {
        return AirDrop.getClaimers(chainId)
    }, [chainId])
}
