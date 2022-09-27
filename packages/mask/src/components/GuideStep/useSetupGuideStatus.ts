import { useMemo } from 'react'
import { useValueRef } from '@masknet/shared-base-ui'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import { currentSetupGuideStatus } from '../../../shared/legacy-settings/settings.js'
import type { SetupGuideContext } from '../../../shared/legacy-settings/types.js'

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
