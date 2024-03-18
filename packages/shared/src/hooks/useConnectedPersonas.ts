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
import { useQuery, type UseQueryResult } from '@tanstack/react-query'

export function useConnectedPersonas(): UseQueryResult<
    Array<{ persona: PersonaInformation; proof: BindingProof[]; avatar: string | undefined }>
> {
    const personasInDB = useAllPersonas()
    const result = useQuery({
        enabled: personasInDB.length > 0,
        queryKey: ['connected-persona', personasInDB],
        refetchOnMount: true,
        queryFn: async () => {
            const allPersonaPublicKeys = personasInDB.map((x) => x.identifier.publicKeyAsHex)
            const allPersonaIdentifiers = personasInDB.map((x) => x.identifier)

            const avatars = await queryPersonaAvatar?.(allPersonaIdentifiers)
            const bindings = await NextIDProof.queryAllExistedBindingsByPlatform(
                NextIDPlatform.NextID,
                allPersonaPublicKeys.join(','),
            )

            return personasInDB.map((x) => {
                return {
                    persona: x,
                    proof:
                        bindings
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
