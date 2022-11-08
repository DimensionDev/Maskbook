import { useEffect } from 'react'
import { useAsyncRetry } from "react-use"
import { first } from 'lodash-es'
import type { SocialIdentity } from "@masknet/web3-shared-base"
import type { IdentityResolved } from "../types.js"
import { useIsOwnerIdentity } from "./useIsOwnerIdentity.js"

async function queryPersonaFromDB(identityResolved: IdentityResolved) {
    if (!identityResolved.identifier) return
    return Services.Identity.queryPersonaByProfile(identityResolved.identifier)
}

async function queryPersonasFromNextID(identityResolved: IdentityResolved) {
    if (!identityResolved.identifier) return
    if (!activatedSocialNetworkUI.configuration.nextIDConfig?.platform) return
    return NextIDProof.queryAllExistedBindingsByPlatform(
        activatedSocialNetworkUI.configuration.nextIDConfig?.platform,
        identityResolved.identifier.userId,
    )
}

/**
 * Get the social identity of the given identity
 */
 export function useSocialIdentity(identity: IdentityResolved | null | undefined) {
    const isOwner = useIsOwnerIdentity(identity)

    const result = useAsyncRetry<SocialIdentity | undefined>(async () => {
        if (!identity) return
        const bindings = await queryPersonasFromNextID(identity)
        const persona = await queryPersonaFromDB(identity)
        const personaBindings =
            bindings?.filter((x) => x.persona === persona?.identifier.publicKeyAsHex.toLowerCase()) ?? []
        return {
            ...identity,
            isOwner,
            publicKey: persona?.identifier.publicKeyAsHex,
            hasBinding: personaBindings.length > 0,
            binding: first(personaBindings),
        }
    }, [isOwner, identity])

    useEffect(() => MaskMessages.events.ownProofChanged.on(result.retry), [result.retry])

    return result
}