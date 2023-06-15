import { useMemo } from 'react'
import { useValueRef } from '@masknet/shared-base-ui'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import { currentSetupGuideStatus, type SetupGuideContext } from '@masknet/shared-base'

export function useSetupGuideStatus() {
    const context = useValueRef(currentSetupGuideStatus[activatedSocialNetworkUI.networkIdentifier])
    return useMemo<SetupGuideContext>(() => {
        try {
            return JSON.parse(context)
        } catch {
            return {}
        }
    }, [context])
}
