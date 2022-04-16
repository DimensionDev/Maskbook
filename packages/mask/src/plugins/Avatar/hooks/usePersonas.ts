import { NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import Services from '../../../extension/service'

export function usePersonas() {
    const personaConnectStatus = usePersonaConnectStatus()
    const identity = useCurrentVisitingIdentity()
    const currentIdentity = useLastRecognizedIdentity()

    return useAsyncRetry(async () => {
        if (!currentIdentity) return
        const persona = await Services.Identity.queryPersonaByProfile(currentIdentity.identifier)
        if (!persona) return
        const binds = await NextIDProof.queryExistedBindingByPersona(persona.publicHexKey!)

        const isOwner = currentIdentity.identifier.toText() === identity.identifier.toText()

        const wallets = binds?.proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum)

        return { wallets, isOwner, binds, persona, status: personaConnectStatus }
    }, [currentIdentity, identity, personaConnectStatus.hasPersona])
}
