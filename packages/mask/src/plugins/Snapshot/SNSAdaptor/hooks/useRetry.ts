import { useCallback } from 'react'
import { useUpdate } from 'react-use'
import { votesRetry } from './useVotes'
import { resultsRetry } from './useResults'

export function useRetry() {
    const forceUpdate = useUpdate()
    return useCallback(() => {
        votesRetry()
        resultsRetry()
        forceUpdate()
    }, [])
}
