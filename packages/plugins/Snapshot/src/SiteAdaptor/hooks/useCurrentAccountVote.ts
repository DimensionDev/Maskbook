import { useChainContext } from '@masknet/web3-hooks-base'
import { Snapshot } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'

export function useCurrentAccountVote(proposalId: string, totalVotes: number) {
    const { account } = useChainContext()

    return useAsyncRetry(async () => {
        if (!proposalId || !account || !totalVotes) return

        return Snapshot.getCurrentAccountVote(proposalId, totalVotes, account)
    }, [proposalId, account, totalVotes])
}
