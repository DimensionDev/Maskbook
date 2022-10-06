import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { first } from 'lodash-unified'
import type { IdentityResolved } from '@masknet/plugin-infra/content-script'
import type { NextIDPlatform } from '@masknet/shared-base'
import type { SocialIdentity } from '@masknet/web3-shared-base'
import { useIsOwnerIdentity } from './useIsOwnerIdentity.js'
import { NextIDProof } from '@masknet/web3-providers'
import { useMessages, useSocialNetwork } from './useContext.js'

async function queryPersonasFromNextID(platform: NextIDPlatform, identityResolved: IdentityResolved) {
    if (!identityResolved.identifier) return
    return NextIDProof.queryAllExistedBindingsByPlatform(platform, identityResolved.identifier.userId)
}

async function queryPersonaFromDB(identityResolved: IdentityResolved) {
    if (!identityResolved.identifier) return
    return Services.Identity.queryPersonaByProfile(identityResolved.identifier)
}

/**
 * Get the social identity of the given identity
 */
export function useSocialIdentity(identity: IdentityResolved | null | undefined) {
    const socialNetwork = useSocialNetwork()
    const messages = useMessages()
    const isOwner = useIsOwnerIdentity(identity)
    const platform = socialNetwork.configuration.nextIDConfig?.platform

    const result = useAsyncRetry<SocialIdentity | undefined>(async () => {
        if (!identity) return
        if (!platform) return
        const bindings = await queryPersonasFromNextID(platform, identity)
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
    }, [isOwner, identity, platform])

    useEffect(() => messages.events.ownProofChanged.on(result.retry), [messages, result.retry])

    return result
}
