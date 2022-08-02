import { NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import { useSubscription } from 'use-subscription'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import { activatedSocialNetworkUI } from '../../../social-network'
import { context } from '../context'

export function usePersonas(userId?: string) {
    const personaConnectStatus = usePersonaConnectStatus()
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform
    const identifier = useSubscription(context.lastRecognizedProfile)
    const currentIdentifier = useSubscription(context.currentVisitingProfile)
    return useAsyncRetry(async () => {
        if (!identifier?.identifier?.userId || !personaConnectStatus.currentPersona?.identifier.publicKeyAsHex) return

        const personaBindings = await NextIDProof.queryExistedBindingByPersona(
            personaConnectStatus.currentPersona?.identifier.publicKeyAsHex,
        )

        const isOwner = userId
            ? currentIdentifier?.identifier?.toText() === userId.toLowerCase()
            : currentIdentifier?.identifier &&
              identifier.identifier &&
              currentIdentifier?.identifier.toText() === identifier.identifier.toText()

        const wallets = personaBindings?.proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum) ?? []
        return { wallets, isOwner, binds: personaBindings, status: personaConnectStatus }
    }, [currentIdentifier, identifier, personaConnectStatus.hasPersona, platform, userId])
}
