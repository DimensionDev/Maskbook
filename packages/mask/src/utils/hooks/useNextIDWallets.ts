import { NextIDPersonaBindings, NextIDPlatform } from '@masknet/shared-base'
import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import { first } from 'lodash-unified'

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

const sortPersonaBindings = (a: NextIDPersonaBindings, b: NextIDPersonaBindings, userId: string): number => {
    const p_a = first(a.proofs.filter((x) => x.identity === userId.toLowerCase()))
    const p_b = first(b.proofs.filter((x) => x.identity === userId.toLowerCase()))

    if (!p_a || !p_b) return 0
    if (p_a.created_at > p_b.created_at) return -1
    return 1
}
