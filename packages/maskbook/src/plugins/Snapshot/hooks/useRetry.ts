import { useCallback } from 'react'
import { useUpdate } from 'react-use'
import { proposalErrorRetry } from '../hooks/useProposal'
import { votesErrorRetry } from '../hooks/useVotes'
import { resultsErrorRetry } from '../hooks/useResults'

export function useRetry() {
    const forceUpdate = useUpdate()
    return useCallback(() => {
        proposalErrorRetry()
        votesErrorRetry()
        resultsErrorRetry()
        forceUpdate()
    }, [])
}
