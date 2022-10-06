import { useValueRef } from '@masknet/shared-base-ui'
import { IDENTITY_RESOLVED_DEFAULTS } from '../constants/index.js'
import { useSocialNetwork } from './useContext.js'

export function useCurrentVisitingIdentity() {
    const socialNetwork = useSocialNetwork()
    return useValueRef(
        socialNetwork.collecting.currentVisitingIdentityProvider?.recognized || IDENTITY_RESOLVED_DEFAULTS,
    )
}
