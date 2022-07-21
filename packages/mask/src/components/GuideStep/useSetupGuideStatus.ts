import {  useMemo } from 'react'
import { useValueRef } from '@masknet/shared-base-ui'
import { activatedSocialNetworkUI } from '../../social-network'
import { currentSetupGuideStatus,  } from '../../settings/settings'
import type { SetupGuideContext } from '../../settings/types'

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
