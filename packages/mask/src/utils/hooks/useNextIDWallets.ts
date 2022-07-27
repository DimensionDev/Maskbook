import { NextIDPlatform } from '@masknet/shared-base'
import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import { first } from 'lodash-unified'
import { sortPersonaBindings } from '../utils'

export function useNextIDWallets(userId?: string, platform?: NextIDPlatform) {
    return useAsyncRetry(async () => {
        if (!userId) return
        const personaBindings = await NextIDProof.queryExistedBindingByPlatform(
            platform ?? NextIDPlatform.Twitter,
            userId.toLowerCase(),
        )

        const currentPersonaBinding = first(
            personaBindings.sort((a, b) => sortPersonaBindings(a, b, userId.toLowerCase() ?? '')),
        )
        if (!currentPersonaBinding) return

        return currentPersonaBinding?.proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum)
    }, [userId, platform])
}
