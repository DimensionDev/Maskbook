import { useQuery } from '@tanstack/react-query'
import { Firefly } from '@masknet/web3-providers'
import type { FireflyBaseAPI } from '@masknet/web3-providers/types'

export function useFireflyLensAccounts(twitterId?: string) {
    return useQuery<FireflyBaseAPI.LensAccount[]>({
        queryKey: ['firefly', 'lens', twitterId],
        enabled: !!twitterId,
        queryFn: () => Firefly.getLensByTwitterId(twitterId),
    })
}
