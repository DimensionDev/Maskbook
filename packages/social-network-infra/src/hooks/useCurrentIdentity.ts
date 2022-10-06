import { first } from 'lodash-unified'
import { useLastRecognizedIdentity } from './useLastRecognizedIdentity.js'
import { useGlobalState } from './useContext.js'
import { useValueRef } from '@masknet/shared-base-ui'

export function useCurrentIdentity() {
    const globalState = useGlobalState()
    const lastRecognizedIdentity = useLastRecognizedIdentity()
    const profiles = useValueRef(globalState.profiles)

    return profiles.find((x) => x.identifier === lastRecognizedIdentity.identifier) || first(profiles)
}
