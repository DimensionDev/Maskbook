import type { PersonaInformation, ProfileInformation, NextIDPlatform, PersonaIdentifier } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { queryCurrentPersona_internal, queryOwnedPersonaInformation } from '../persona/query'

export interface ProfileInformationWithNextID extends ProfileInformation {
    is_valid?: boolean
    identity?: string
    platform?: NextIDPlatform
}
export async function queryOwnedProfileInformationWithNextID() {
    const list = await queryOwnedPersonaInformation()
    const id = await queryCurrentPersona_internal(list)
    return queryOwnedProfileInformationWithNextID_internal(list, id)
}
/** @internal */
export async function queryOwnedProfileInformationWithNextID_internal(
    ownedPersonas: PersonaInformation[],
    currentPersonaID: PersonaIdentifier | undefined,
): Promise<ProfileInformationWithNextID[]> {
    const currentPersona = ownedPersonas.find((x) => x.identifier.equals(currentPersonaID))

    if (!currentPersona) return []
    if (!currentPersona.publicHexKey) return currentPersona.linkedProfiles

    const response = await NextIDProof.queryExistedBindingByPersona(currentPersona.publicHexKey)
    if (!response) return currentPersona.linkedProfiles

    return currentPersona.linkedProfiles.map((profile) => {
        const target = response.proofs.find(
            (x) =>
                profile.identifier.userId.toLowerCase() === x.identity.toLowerCase() &&
                profile.identifier.network.replace('.com', '') === x.platform,
        )

        return {
            ...profile,
            platform: target?.platform,
            identity: target?.identity,
            is_valid: target?.is_valid,
        }
    })
}
