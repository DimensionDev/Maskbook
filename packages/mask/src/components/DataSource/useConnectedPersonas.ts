import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAsync } from 'react-use'
import Services from '../../extension/service'
import { usePersonasFromDB } from './usePersonasFromDB'

export function useConnectedPersonas() {
    const personasInDB = usePersonasFromDB()

    return useAsync(async () => {
        const allPersonaPublicKeys = personasInDB.map((x) => x.identifier.publicKeyAsHex)
        const allPersonaIdentifiers = personasInDB.map((x) => x.identifier)

        const avatars = await Services.Identity.getPersonaAvatars(allPersonaIdentifiers)
        const allNextIDBindings = await NextIDProof.queryExistedBindingByPlatform(
            NextIDPlatform.NextID,
            allPersonaPublicKeys.join(','),
        )

        return personasInDB.map((x) => {
            return {
                persona: x,
                proof:
                    allNextIDBindings
                        .find((p) => p.persona.toLowerCase() === x.identifier.publicKeyAsHex.toLowerCase())
                        ?.proofs.filter((x) => x.is_valid) ?? EMPTY_LIST,
                avatar: avatars.get(x.identifier),
            }
        })
    }, [personasInDB.length])
}
