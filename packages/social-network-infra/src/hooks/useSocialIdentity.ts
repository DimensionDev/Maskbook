import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import type { IdentityResolved } from '@masknet/plugin-infra/content-script'
import type { SocialIdentity } from '@masknet/web3-shared-base'
import { useIdentityOwned } from './useIdentityOwned.js'
import { useMessages, useSocialNetworkConfiguration } from './useContext.js'
import { usePersonaFromDB } from './usePersonaFromDB.js'
import { usePersonaFromNextID } from './usePersonaFromNextID.js'

/**
 * Get the social identity of the given identity
 */
export function useSocialIdentity(identityResolved: IdentityResolved | undefined) {
    const platform = useSocialNetworkConfiguration((x) => x.nextIDConfig?.platform)
    const messages = useMessages()
    const isOwner = useIdentityOwned(identityResolved)
    const { value: personaFromDB } = usePersonaFromDB(identityResolved)
    const { value: personaFromNextID } = usePersonaFromNextID(identityResolved)

    const asyncResult = useAsyncRetry<SocialIdentity | undefined>(async () => {
        if (!identityResolved) return
        if (!platform) return
        return {
            ...identityResolved,
            isOwner,
            publicKey: personaFromDB?.identifier.publicKeyAsHex,
            hasBinding: !!personaFromNextID,
            binding: personaFromNextID,
        }
    }, [isOwner, identityResolved, platform, personaFromDB?.identifier.toText(), personaFromNextID?.persona])

    useEffect(() => messages.events.ownProofChanged.on(asyncResult.retry), [messages, asyncResult.retry])

    return asyncResult
}
