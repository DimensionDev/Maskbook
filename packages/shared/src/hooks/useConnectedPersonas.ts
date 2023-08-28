import { useEffect } from 'react'
import {
    EMPTY_LIST,
    MaskMessages,
    NextIDPlatform,
    type BindingProof,
    type PersonaInformation,
} from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAllPersonas, useSiteAdaptorContext } from '@masknet/plugin-infra/content-script'
import { useQuery } from '@tanstack/react-query'

export function useConnectedPersonas() {
    const personasInDB = useAllPersonas()
    const { getPersonaAvatars } = useSiteAdaptorContext()

    const result = useQuery<
        Array<{ persona: PersonaInformation; proof: BindingProof[]; avatar: string | undefined }>,
        Error
    >({
        queryFn: async () => {
            const allPersonaPublicKeys = personasInDB.map((x) => x.identifier.publicKeyAsHex)
            const allPersonaIdentifiers = personasInDB.map((x) => x.identifier)

            const avatars = await getPersonaAvatars?.(allPersonaIdentifiers)
            const allNextIDBindings = await NextIDProof.queryAllExistedBindingsByPlatform(
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
                    avatar: avatars?.get(x.identifier),
                }
            })
        },
    })

    useEffect(() => MaskMessages.events.ownProofChanged.on(() => result.refetch()), [result.refetch])

    return result
}
