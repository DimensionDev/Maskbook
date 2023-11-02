import { useMemo } from 'react'
import { currentSetupGuideStatus, type SetupGuideContext } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { activatedSiteAdaptorUI } from '../../site-adaptor-infra/index.js'

export function useSetupGuideStatus() {
    const context = useValueRef(currentSetupGuideStatus[activatedSiteAdaptorUI!.networkIdentifier])
    return useMemo<SetupGuideContext>(() => {
        try {
            return JSON.parse(context)
        } catch {
            return {}
        }
    }, [context])
}
