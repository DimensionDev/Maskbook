import { lastRecognizedProfile } from './context.js'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'

export function useLastRecognizedIdentity() {
    return useSubscriptionMaybe(lastRecognizedProfile, undefined)
}

export function getLastRecognizedIdentity() {
    return lastRecognizedProfile.getCurrentValue()
}
