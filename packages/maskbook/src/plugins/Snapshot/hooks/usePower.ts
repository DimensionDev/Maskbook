import { useAsyncRetry } from 'react-use'
import { PluginSnapshotRPC } from '../messages'
import type { ProposalIdentifier } from '../types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useProposal } from './useProposal'
import { useBlockNumber } from '../../../web3/hooks/useBlockNumber'

export function usePower(identifier: ProposalIdentifier) {
    const {
        payload: { message },
    } = useProposal(identifier.id)

    const blockNumber = useBlockNumber()
    const account = useAccount()
    return useAsyncRetry(async () => {
        if (!account || !blockNumber) return 0
        const scores = await PluginSnapshotRPC.getScores(message, [account], blockNumber)
        return scores[0]![account]!
    }, [blockNumber, account])
}
