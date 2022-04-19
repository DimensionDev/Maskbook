import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import { useNextIDConnectStatus } from '../../../components/DataSource/useNextID'
import Services from '../../../extension/service'
import { activatedSocialNetworkUI } from '../../../social-network'
import { context } from '../context'

export function usePersonaVerify() {
    const { reset, isVerified } = useNextIDConnectStatus()
    const visitingPersonaIdentifier = context.lastRecognizedProfile.getCurrentValue()
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform

    return useAsyncRetry(async () => {
        if (!visitingPersonaIdentifier?.identifier) return
        const persona = await Services.Identity.queryPersonaByProfile(visitingPersonaIdentifier.identifier)
        if (!persona?.publicHexKey) return
        const verified = await NextIDProof.queryIsBound(
            persona.publicHexKey,
            platform,
            visitingPersonaIdentifier.identifier.toText(),
        )
        return { reset, verified }
    }, [visitingPersonaIdentifier?.identifier, platform, reset, isVerified])
}
