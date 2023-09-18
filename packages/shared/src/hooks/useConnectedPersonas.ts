import { useEffect } from 'react'
import {
    EMPTY_LIST,
    MaskMessages,
    NextIDPlatform,
    type BindingProof,
    type PersonaInformation,
} from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useAllPersonas } from '@masknet/plugin-infra/content-script'
import { queryPersonaAvatar } from '@masknet/plugin-infra/dom/context'
import { useQuery } from '@tanstack/react-query'

export function useConnectedPersonas() {
    const personasInDB = useAllPersonas()
    const result = useQuery<
        Array<{ persona: PersonaInformation; proof: BindingProof[]; avatar: string | undefined }>,
        Error
    >({
        queryKey: ['connected-persona', personasInDB],
        queryFn: async () => {
            const allPersonaPublicKeys = personasInDB.map((x) => x.identifier.publicKeyAsHex)
            const allPersonaIdentifiers = personasInDB.map((x) => x.identifier)

            const avatars = await queryPersonaAvatar?.(allPersonaIdentifiers)
            const allNextIDBindings = await NextIDProof.queryAllExistedBindingsByPlatform(
                NextIDPlatform.NextID,
                allPersonaPublicKeys.join(','),
                undefined,
                true,
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
