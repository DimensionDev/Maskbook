import type { NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import { useSubscription } from 'use-subscription'
import Services from '../../../extension/service.js'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import { context } from '../context.js'

export function usePersonaVerify() {
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const visitingPersonaIdentifier = useSubscription(context.lastRecognizedProfile)
    return useAsyncRetry(async () => {
        if (!visitingPersonaIdentifier?.identifier) return
        const persona = await Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)
        if (!persona?.identifier.publicKeyAsHex) return
        const isVerified = await NextIDProof.queryIsBound(
            persona.identifier.publicKeyAsHex,
            platform,
            visitingPersonaIdentifier.identifier.userId,
        )
        return { isVerified }
    }, [platform, visitingPersonaIdentifier])
}
