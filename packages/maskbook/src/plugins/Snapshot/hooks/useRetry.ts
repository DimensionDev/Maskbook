import { useCallback } from 'react'
import { useUpdate } from 'react-use'
import { proposalRetry } from '../hooks/useProposal'
import { votesRetry } from '../hooks/useVotes'
import { resultsRetry } from '../hooks/useResults'

export function useRetry() {
    const forceUpdate = useUpdate()
    return useCallback(() => {
        proposalRetry()
        votesRetry()
        resultsRetry()
        forceUpdate()
    }, [])
}
