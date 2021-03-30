import { useAsyncRetry } from 'react-use'
import { PluginSnapshotRPC } from '../messages'
import type { ProposalIdentifier } from '../types'

export function useVotes(identifier?: ProposalIdentifier) {
    return useAsyncRetry(async () => {
        if (!identifier) return []
        return PluginSnapshotRPC.fetchAllVotesOfProposal(identifier.id, identifier.space)
    }, [identifier?.id, identifier?.space])
}
