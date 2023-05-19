import { useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Firefly } from '@masknet/web3-providers'
import type { FireflyBaseAPI } from '@masknet/web3-providers/types'

export function useFireflyLensAccounts(userId?: string) {
    return useQuery<FireflyBaseAPI.LensAccount[]>({
        queryKey: ['firefly', 'lens', useId],
        enabled: !!useId,
        queryFn: () => Firefly.getLensByTwitterId(userId),
    })
}
