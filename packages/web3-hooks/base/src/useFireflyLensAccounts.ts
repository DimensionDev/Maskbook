import { useQuery } from '@tanstack/react-query'
import { FireflyConfig } from '@masknet/web3-providers'
import type { FireflyConfigAPI } from '@masknet/web3-providers/types'

export function useFireflyLensAccounts(twitterId?: string, isVerified?: boolean) {
    return useQuery<FireflyConfigAPI.LensAccount[]>({
        queryKey: ['firefly', 'lens', twitterId, isVerified],
        enabled: !!twitterId,
        queryFn: () => FireflyConfig.getLensByTwitterId(twitterId, isVerified),
    })
}
