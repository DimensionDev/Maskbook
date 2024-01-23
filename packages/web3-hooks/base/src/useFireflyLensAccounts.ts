import { useQuery } from '@tanstack/react-query'
import { FireflyConfig } from '@masknet/web3-providers'
import type { FireflyConfigAPI } from '@masknet/web3-providers/types'
import type { UseQueryResult } from '@tanstack/react-query'

// The inferred type of 'useFireflyLensAccounts' cannot be named without a reference to @tanstack/react-query
type T = UseQueryResult

export function useFireflyLensAccounts(twitterId?: string, isVerified?: boolean) {
    return useQuery<FireflyConfigAPI.LensAccount[]>({
        queryKey: ['firefly', 'lens', twitterId, isVerified],
        enabled: !!twitterId,
        queryFn: () => FireflyConfig.getLensByTwitterId(twitterId, isVerified),
    })
}
