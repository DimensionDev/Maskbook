import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import type { IdentityResolved } from '@masknet/plugin-infra/content-script'
import { useSocialNetworkConfiguration } from './useContext.js'
import { sortPersonaBindings } from '../utils/index.js'

/**
 * Get all bound personas around the identity from the NextID service.
 * @param identityResolved
 * @returns
 */
export function usePersonasFromNextID(identityResolved: IdentityResolved | undefined) {
    const platform = useSocialNetworkConfiguration((x) => x.nextIDConfig?.platform)

    return useAsyncRetry(async () => {
        if (!platform) return
        if (!identityResolved?.identifier) return
        const bindings = await NextIDProof.queryAllExistedBindingsByPlatform(
            platform,
            identityResolved.identifier.userId,
        )
        return bindings?.sort((a, b) => sortPersonaBindings(a, b, identityResolved.identifier?.userId.toLowerCase()))
    }, [platform, identityResolved?.identifier?.toText()])
}
