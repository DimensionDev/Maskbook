import { useAsyncRetry } from 'react-use'
import { PluginSnapshotRPC } from '../messages'
import type { ProposalIdentifier } from '../types'

export function useProposal(identifier?: ProposalIdentifier) {
    return useAsyncRetry(async () => {
        if (!identifier) return null
        return PluginSnapshotRPC.fetchProposal(identifier.id)
    }, [identifier?.id])
}
