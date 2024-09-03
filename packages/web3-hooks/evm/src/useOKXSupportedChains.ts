import { OKX } from '@masknet/web3-providers'
import { skipToken, useQuery } from '@tanstack/react-query'

export function useSupportedChains(enabled = true) {
    return useQuery({
        queryKey: ['okx-swap', 'supported-chains'],
        queryFn:
            enabled ?
                async () => {
                    const chains = await OKX.getSupportedChains()
                    // use ethereum chains only
                    return chains?.filter((x) => x.dexTokenApproveAddress)
                }
            :   skipToken,
    })
}
