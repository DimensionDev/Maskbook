import { createContainer } from 'unstated-next'
import { useBlockie } from '../../../web3/hooks/useBlockie'
import type { ProposalIdentifier, ProposalMessage } from '../types'
import { useProposal } from './useProposal'
import { useVotes } from './useVotes'

export const SnapshotState = createContainer(useSnapshotState)

export function useSnapshotState(identifier?: ProposalIdentifier) {
    const proposal = useProposal(identifier)
    const votes = useVotes(identifier)
    return {
        identifier,
        proposal,
        votes,
        message: proposal.value?.msg ? (JSON.parse(proposal.value.msg) as ProposalMessage) : null,
    }
}
