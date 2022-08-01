import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsync } from 'react-use'
import Services from '../../../extension/service'

export function useConnectedPersonas() {
    return useAsync(async () => {
        const personasInDB = await Services.Identity.queryOwnedPersonaInformation(false)
        const allPersonaIdentifiers = personasInDB.map((x) => x.identifier.publicKeyAsHex)
        const allNextIDBinds = await NextIDProof.queryExistedBindingByPlatform(
            NextIDPlatform.NextID,
            allPersonaIdentifiers.join(','),
        )

        return personasInDB.map((x) => {
            return {
                persona: x,
                proof:
                    allNextIDBinds
                        .find((p) => p.persona.toLowerCase() === x.identifier.publicKeyAsHex.toLowerCase())
                        ?.proofs.filter((x) => x.is_valid) ?? EMPTY_LIST,
            }
        })
    }, [])
}
