import { SmartPayBundler } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'

export function useSmartPayChainId() {
    return useQuery({
        queryKey: ['smart-pay', 'chain-id'],
        networkMode: 'always',
        queryFn: async () => SmartPayBundler.getSupportedChainId(),
    }).data
}
