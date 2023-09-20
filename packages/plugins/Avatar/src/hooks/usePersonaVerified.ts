import { useAsyncRetry } from 'react-use'
import { useSubscription } from 'use-subscription'
import { NextIDProof } from '@masknet/web3-providers'
import { useSiteAdaptorContext } from '@masknet/plugin-infra/content-script'
import { currentNextIDPlatform, lastRecognizedProfile } from '@masknet/plugin-infra/content-script/context'
import { NextIDPlatform } from '@masknet/shared-base'

export function usePersonaVerify() {
    const { queryPersonaByProfile } = useSiteAdaptorContext()
    const visitingPersonaIdentifier = useSubscription(lastRecognizedProfile)
    return useAsyncRetry(async () => {
        if (!visitingPersonaIdentifier?.identifier) return
        const persona = await queryPersonaByProfile(visitingPersonaIdentifier.identifier)
        if (!persona?.identifier.publicKeyAsHex) return
        const isVerified = await NextIDProof.queryIsBound(
            persona.identifier.publicKeyAsHex,
            currentNextIDPlatform ?? NextIDPlatform.Twitter,
            visitingPersonaIdentifier.identifier.userId,
        )
        return { isVerified }
    }, [visitingPersonaIdentifier, queryPersonaByProfile])
}
