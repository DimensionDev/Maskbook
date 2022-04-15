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

    const { value: currentPersona, loading: loadingCurrentPersona } = useAsyncRetry(async () => {
        if (!currentIdentity) return
        return Services.Identity.queryPersonaByProfile(currentIdentity.identifier)
    }, [currentIdentity, personaConnectStatus.hasPersona])
    const { value: binds, loading: loadingBinds } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return NextIDProof.queryExistedBindingByPersona(currentPersona.publicHexKey!)
    }, [currentPersona])

    const isOwner = currentIdentity.identifier.toText() === identity.identifier.toText()
    const wallets = binds?.proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum)

    return {
        loading: loadingCurrentPersona || loadingBinds,

        isOwner,
        binds,
        personaConnectStatus,
        wallets,
    }
}
