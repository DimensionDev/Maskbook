import { useValueRef } from '@masknet/shared'
import { currentSingleHopOnlySettings } from '../../settings'

export function useSingleHopOnly() {
    return useValueRef(currentSingleHopOnlySettings)
}
