import { useValueRef } from '@masknet/shared-base'
import { currentSingleHopOnlySettings } from '../../settings'

export function useSingleHopOnly() {
    const singleHopOnly = useValueRef(currentSingleHopOnlySettings)
    return singleHopOnly
}
