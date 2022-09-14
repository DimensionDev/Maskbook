import { useCallback } from 'react'
import { useUpdate } from 'react-use'
import { votesRetry } from './useVotes.js'
import { resultsRetry } from './useResults.js'

export function useRetry() {
    const forceUpdate = useUpdate()
    return useCallback(() => {
        votesRetry()
        resultsRetry()
        forceUpdate()
    }, [])
}
