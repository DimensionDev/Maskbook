import { useValueRef } from '@masknet/shared-base-ui'
import { currentSingleHopOnlySettings } from '../../settings'

export function useSingleHopOnly() {
    const singleHopOnly = useValueRef(currentSingleHopOnlySettings)
    return singleHopOnly
}
