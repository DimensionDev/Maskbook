import { NextIDProof } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { usePersonaConnectStatus } from '../../../components/DataSource/usePersonaConnectStatus'
import Services from '../../../extension/service'

export function usePersonas() {
    const personaConnectStatus = usePersonaConnectStatus()
    const currentIdentity = useCurrentVisitingIdentity()
    const identity = useLastRecognizedIdentity()

    const { value: currentPersona, loading: loadingPersona } = useAsyncRetry(async () => {
        if (!currentIdentity) return
        return Services.Identity.queryPersonaByProfile(currentIdentity.identifier)
    }, [currentIdentity, personaConnectStatus.hasPersona])
    const { value: binds, loading: loadingBinds } = useAsyncRetry(async () => {
        if (!currentPersona) return
        return NextIDProof.queryExistedBindingByPersona(currentPersona.publicHexKey!)
    }, [currentPersona])

    const isOwner = currentIdentity.identifier.toText() === identity.identifier.toText()

    return { loading: loadingPersona || loadingBinds, isOwner, binds, personaConnectStatus }
}
