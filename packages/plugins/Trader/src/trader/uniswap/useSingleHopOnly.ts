import { useValueRef } from '@masknet/shared-base-ui'
import { currentSingleHopOnlySettings } from '../../settings.js'

export function useSingleHopOnly() {
    const singleHopOnly = useValueRef(currentSingleHopOnlySettings)
    return singleHopOnly
}
