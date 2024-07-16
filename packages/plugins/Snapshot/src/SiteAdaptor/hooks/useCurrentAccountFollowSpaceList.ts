import { useChainContext } from '@masknet/web3-hooks-base'
import { Snapshot } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'

export function useCurrentAccountFollowSpaceList() {
    const { account } = useChainContext()

    return useAsyncRetry(async () => {
        if (!account) return

        return Snapshot.getFollowingSpaceIdList(account)
    }, [account])
}
