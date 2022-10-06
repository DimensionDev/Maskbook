import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import type { IdentityResolved } from '@masknet/plugin-infra/content-script'
import { useSocialNetwork } from './useContext.js'

/**
 * Get all bound personas around the identity.
 * @param identityResolved
 * @returns
 */
export function usePersonaFromNextID(identityResolved: IdentityResolved) {
    const socialNetwork = useSocialNetwork()
    const platform = socialNetwork.configuration.nextIDConfig?.platform

    return useAsyncRetry(async () => {
        if (!platform) return
        if (!identityResolved.identifier) return
        return NextIDProof.queryAllExistedBindingsByPlatform(platform, identityResolved.identifier.userId)
    }, [socialNetwork, identityResolved.identifier?.userId, NextIDProof])
}

// import { useEffect } from 'react'
// import { useAsyncRetry } from 'react-use'
// import { EMPTY_LIST } from '@masknet/shared-base'
// import { NextIDProof } from '@masknet/web3-providers'
// import { MaskMessages } from '../../utils/index.js'
// import { activatedSocialNetworkUI } from '../../social-network/index.js'

// /**
//  * Get all personas bound with the given identity from NextID service
//  */
// export function usePersonasFromNextID(
//     userId?: string,
//     platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform,
// ) {
//     const asyncRetry = useAsyncRetry(async () => {
//         if (!platform || !userId) return EMPTY_LIST
//         return NextIDProof.queryAllExistedBindingsByPlatform(platform, userId)
//     }, [platform, userId])
//     useEffect(() => MaskMessages.events.ownProofChanged.on(asyncRetry.retry), [asyncRetry.retry])
//     return asyncRetry
// }
