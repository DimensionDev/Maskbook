import { NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { first } from 'lodash-unified'
import { useAsyncRetry } from 'react-use'
import { useSubscription } from 'use-subscription'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import { activatedSocialNetworkUI } from '../../../social-network'
import { context } from '../context'
import { sortPersonaBindings } from '../utils'

export function usePersonas(userId?: string) {
    const personaConnectStatus = usePersonaConnectStatus()
    const currentIdentifier = useSubscription(context.currentVisitingProfile)
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const identifier = useSubscription(context.lastRecognizedProfile)
    return useAsyncRetry(async () => {
        if (!identifier?.identifier?.userId) return
        const personaBindings = await NextIDProof.queryExistedBindingByPlatform(
            platform,
            userId?.toLowerCase() ?? identifier.identifier.userId.toLowerCase(),
        )

        const currentPersonaBinding = first(
            personaBindings.sort((a, b) =>
                sortPersonaBindings(a, b, userId?.toLowerCase() ?? identifier.identifier?.userId.toLowerCase() ?? ''),
            ),
        )
        if (!currentPersonaBinding) return

        const isOwner = userId
            ? currentIdentifier?.identifier?.toText() === userId.toLowerCase()
            : currentIdentifier?.identifier &&
              identifier.identifier &&
              currentIdentifier?.identifier.toText() === identifier.identifier.toText()
        const wallets = currentPersonaBinding?.proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum)
        return { wallets, isOwner, binds: currentPersonaBinding, status: personaConnectStatus }
    }, [currentIdentifier, identifier, personaConnectStatus.hasPersona, platform, userId])
}
