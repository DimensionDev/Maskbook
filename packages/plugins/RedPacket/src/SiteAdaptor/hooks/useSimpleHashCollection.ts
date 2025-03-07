import { SimpleHashEVM } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { skipToken, useQuery } from '@tanstack/react-query'

export function useSimpleHashCollection(address: string | undefined, chainId: ChainId | undefined) {
    return useQuery({
        queryKey: ['simple-hash', 'collection', chainId, address],
        queryFn:
            address && chainId ? () => SimpleHashEVM.getCollectionByContractAddress(address, { chainId }) : skipToken,
    })
}
