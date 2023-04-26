import { useChainContext } from '@masknet/web3-hooks-base'
import { Snapshot } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'

export function useCurrentAccountVote(proposalId: string) {
    const { account } = useChainContext()

    return useAsyncRetry(async () => {
        if (!proposalId || !account) return

        return Snapshot.getCurrentAccountVote(proposalId, account)
    }, [proposalId, account])
}
