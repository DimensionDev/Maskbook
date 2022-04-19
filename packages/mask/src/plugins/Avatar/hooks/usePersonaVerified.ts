import type { NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import { activatedSocialNetworkUI } from '../../../social-network'
import { context } from '../context'

export function usePersonaVerify() {
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    return useAsyncRetry(async () => {
        const visitingPersonaIdentifier = context.lastRecognizedProfile.getCurrentValue()
        if (!visitingPersonaIdentifier?.identifier) return
        const persona = await Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)
        if (!persona?.publicHexKey) return
        const isVerified = await NextIDProof.queryIsBound(
            persona.publicHexKey,
            platform,
            visitingPersonaIdentifier.identifier.userId,
        )
        return { isVerified }
    }, [platform, context])
}
