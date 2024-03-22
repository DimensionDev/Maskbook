import { useSubscription } from 'use-subscription'
import { UNDEFINED } from '@masknet/shared-base'
import { lastRecognizedProfile } from './context.js'

export function useMyIdentity() {
    return useSubscription(lastRecognizedProfile ?? UNDEFINED)
}
