import { useQuery } from '@tanstack/react-query'
import { Firefly } from '@masknet/web3-providers'
import type { FireflyBaseAPI } from '@masknet/web3-providers/types'

export function useFireflyLensAccounts(twitterId?: string, isVerified?: boolean) {
    return useQuery<FireflyBaseAPI.LensAccount[]>({
        queryKey: ['firefly', 'lens', twitterId, isVerified],
        enabled: !!twitterId,
        queryFn: () => Firefly.getLensByTwitterId(twitterId, isVerified),
    })
}
