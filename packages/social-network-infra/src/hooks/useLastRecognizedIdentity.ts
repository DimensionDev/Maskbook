import { useValueRef } from '@masknet/shared-base-ui'
import { useSocialNetwork } from './useContext.js'
import { IDENTITY_RESOLVED_DEFAULTS } from '../constants/index.js'

export function useLastRecognizedIdentity() {
    const socialNetwork = useSocialNetwork()
    return useValueRef(socialNetwork.collecting.identityProvider?.recognized || IDENTITY_RESOLVED_DEFAULTS)
}
