import { first } from 'lodash-unified'
import { useProfiles } from './useProfiles.js'
import { useLastRecognizedIdentity } from './useLastRecognizedIdentity.js'

export function useCurrentIdentity() {
    const profiles = useProfiles()
    const lastRecognizedIdentity = useLastRecognizedIdentity()
    return profiles.find((x) => x.identifier === lastRecognizedIdentity.identifier) || first(profiles)
}
