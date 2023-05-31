import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import Services from '../../extension/service.js'
import { usePersonasFromDB } from './usePersonasFromDB.js'
import { MaskMessages } from '../../utils/index.js'

export function useConnectedPersonas() {
    const personasInDB = usePersonasFromDB()

    const result = useAsyncRetry(async () => {
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
    }, [personasInDB])

    useEffect(() => MaskMessages.events.ownProofChanged.on(result.retry), [result.retry])

    return result
}
