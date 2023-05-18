import { Firefly } from '@masknet/web3-providers'
import { useAsync } from 'react-use'

export function useFireflyLensAccounts(userId?: string) {
    return useAsync(async () => {
        if (!userId) return
        return Firefly.getLensByTwitterId(userId)
    }, [userId])
}
