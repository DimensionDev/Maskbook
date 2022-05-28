import type { NextIDPlatform } from '@masknet/shared-base'
import { useAsyncRetry } from 'react-use'
import { useSubscription } from 'use-subscription'
import Services from '../../../extension/service'
import { activatedSocialNetworkUI } from '../../../social-network'
import { context } from '../context'

export function usePersonaVerify() {
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const visitingPersonaIdentifier = useSubscription(context.lastRecognizedProfile)
    return useAsyncRetry(async () => {
        if (!visitingPersonaIdentifier?.identifier) return
        const persona = await Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)
        if (!persona?.identifier.publicKeyAsHex) return
        const isVerified = await Services.Helper.queryIsBound(
            persona.identifier.publicKeyAsHex,
            platform,
            visitingPersonaIdentifier.identifier.userId,
        )
        return { isVerified }
    }, [platform, visitingPersonaIdentifier])
}
