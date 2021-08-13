import { useValueRef } from '@masknet/shared'
import { currentSingleHopOnlySettings } from '../../settings'

export function useSingleHopOnly() {
    const singleHopOnly = useValueRef(currentSingleHopOnlySettings)
    return singleHopOnly
}
