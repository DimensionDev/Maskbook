import { Firefly } from '@masknet/web3-providers'
import { useQuery } from '@tanstack/react-query'
import { useId } from 'react'

export function useFireflyLensAccounts(userId?: string) {
    return useQuery({
        queryKey: ['firefly', 'lens', useId],
        enabled: !!useId,
        queryFn: () => Firefly.getLensByTwitterId(userId),
    })
}
