import { NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import Services from '../../../extension/service'
import { context } from '../context'

export function usePersonas() {
    const personaConnectStatus = usePersonaConnectStatus()
    const currentIdentifier = context.currentVisitingProfile.getCurrentValue()?.identifier
    const identifier = context.lastRecognizedProfile.getCurrentValue()?.identifier
    return useAsyncRetry(async () => {
        if (!identifier) return
        const persona = await Services.Identity.queryPersonaByProfile(identifier)
        if (!persona) return
        const binds = await NextIDProof.queryExistedBindingByPersona(persona.publicHexKey!)
        const isOwner =
            (!currentIdentifier?.toText() && identifier.toText()) || currentIdentifier?.toText() === identifier.toText()
        const wallets = binds?.proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum)
        return { wallets, isOwner, binds, persona, status: personaConnectStatus }
    }, [currentIdentifier, identifier, personaConnectStatus.hasPersona])
}
