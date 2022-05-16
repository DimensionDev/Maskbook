import { useAsyncRetry } from 'react-use'
import { useAccount } from '@masknet/web3-shared-evm'
import { PluginSnapshotRPC } from '../../messages'
import type { ProposalIdentifier } from '../../types'
import { useProposal } from './useProposal'
import { find, sum } from 'lodash-unified'

export function usePower(identifier: ProposalIdentifier) {
    const { payload: proposal } = useProposal(identifier.id)

    const account = useAccount()
    return useAsyncRetry(async () => {
        if (!account) return 0
        const scores = await PluginSnapshotRPC.getScores(
            proposal.snapshot,
            [account],
            proposal.network,
            identifier.space,
            proposal.strategies,
        )
        return sum(scores.map((score) => find(score, (_, key) => key.toLowerCase() === account.toLowerCase()) ?? 0))
    }, [account])
}
