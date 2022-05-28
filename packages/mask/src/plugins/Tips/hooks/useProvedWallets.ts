import { EMPTY_LIST, NextIDPersonaBindings, NextIDPlatform, PersonaIdentifier } from '@masknet/shared-base'
import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'

export function useProvedWallets(personaIdentifier: PersonaIdentifier | undefined) {
    const res = useAsyncRetry(async () => {
        if (!personaIdentifier) return EMPTY_LIST
        const currentPersona = await Services.Identity.queryPersona(personaIdentifier)
        if (!currentPersona) return EMPTY_LIST
        const { proofs } = (await Services.Helper.queryExistedBindingByPersona(
            currentPersona.identifier.publicKeyAsHex,
        )) as NextIDPersonaBindings
        return proofs.filter((x) => x.platform === NextIDPlatform.Ethereum)
    }, [personaIdentifier])

    return res
}
