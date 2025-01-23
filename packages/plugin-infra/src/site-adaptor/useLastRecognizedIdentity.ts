import { useSubscription } from 'use-subscription'
import { UNDEFINED } from '@masknet/shared-base'
import { lastRecognizedProfile } from './context.js'

export function useLastRecognizedIdentity() {
    return useSubscription(lastRecognizedProfile ?? UNDEFINED)
}

export function getLastRecognizedIdentity() {
    return lastRecognizedProfile.getCurrentValue()
}
