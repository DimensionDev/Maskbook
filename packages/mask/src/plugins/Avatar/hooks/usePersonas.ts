import { NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { first } from 'lodash-unified'
import { useAsyncRetry } from 'react-use'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import { activatedSocialNetworkUI } from '../../../social-network'
import { context } from '../context'
import { sortPersonaBindings } from '../utils'

export function usePersonas() {
    const personaConnectStatus = usePersonaConnectStatus()
    const currentIdentifier = context.currentVisitingProfile.getCurrentValue()?.identifier
    const platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform as NextIDPlatform

    const identifier = context.lastRecognizedProfile.getCurrentValue()?.identifier
    return useAsyncRetry(async () => {
        if (!identifier) return
        const personaBindings = await NextIDProof.queryExistedBindingByPlatform(
            platform,
            identifier?.userId.toLowerCase(),
        )

        const currentPersonaBinding = first(
            personaBindings.sort((a, b) => sortPersonaBindings(a, b, identifier?.userId.toLowerCase())),
        )
        if (!currentPersonaBinding) return

        const isOwner =
            (!currentIdentifier?.toText() && identifier.toText()) || currentIdentifier?.toText() === identifier.toText()
        const wallets = currentPersonaBinding?.proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum)
        return { wallets, isOwner, binds: currentPersonaBinding, status: personaConnectStatus }
    }, [currentIdentifier, identifier, personaConnectStatus.hasPersona, platform])
}
