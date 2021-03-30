import { createContainer } from 'unstated-next'
import type { ProposalIdentifier } from '../types'
import { useProposol } from './useProposal'

export const SnapshotState = createContainer(useSnapshotState)

export function useSnapshotState(identifier?: ProposalIdentifier) {
    const proposal = useProposol(identifier)

    return {
        identifier,
        proposal,
    }
}
