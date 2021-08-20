import { useAsyncRetry } from 'react-use'
import { useAccount, useBlockNumber } from '@masknet/web3-shared'
import { PluginSnapshotRPC } from '../../messages'
import type { ProposalIdentifier } from '../../types'
import { useProposal } from './useProposal'

export function usePower(identifier: ProposalIdentifier) {
    const {
        payload: { message, proposal },
    } = useProposal(identifier.id)

    const account = useAccount()
    const blockNumber = useBlockNumber()
    return useAsyncRetry(async () => {
        if (!account) return 0
        const scores = await PluginSnapshotRPC.getScores(
            message,
            [account],
            blockNumber,
            proposal.network,
            identifier.space,
            proposal.strategies,
        )
        return scores[0]![account]!
    }, [blockNumber, account])
}
