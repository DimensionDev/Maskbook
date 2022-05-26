import type { IdentityResolved } from '@masknet/plugin-infra'
import { NextIDPersonaBindings, NextIDPlatform } from '@masknet/shared-base'
import { useAsyncRetry } from 'react-use'
import { sharedNextIDPlatform } from '../../contexts'
import { NextIDProof } from '@masknet/web3-providers'
import { first } from 'lodash-unified'

export function useNextIDWallets(identifier?: IdentityResolved) {
    const platform = sharedNextIDPlatform.value
    return useAsyncRetry(async () => {
        if (!identifier?.identifier?.userId) return
        const personaBindings = await NextIDProof.queryExistedBindingByPlatform(
            platform ?? NextIDPlatform.Twitter,
            identifier.identifier.userId.toLowerCase(),
        )

        const currentPersonaBinding = first(
            personaBindings.sort((a, b) =>
                sortPersonaBindings(a, b, identifier.identifier?.userId.toLowerCase() ?? ''),
            ),
        )
        if (!currentPersonaBinding) return

        return currentPersonaBinding?.proofs.filter((proof) => proof.platform === NextIDPlatform.Ethereum)
    }, [identifier?.identifier?.userId, platform])
}

const sortPersonaBindings = (a: NextIDPersonaBindings, b: NextIDPersonaBindings, userId: string): number => {
    const p_a = first(a.proofs.filter((x) => x.identity === userId.toLowerCase()))
    const p_b = first(b.proofs.filter((x) => x.identity === userId.toLowerCase()))

    if (!p_a || !p_b) return 0
    if (p_a.created_at > p_b.created_at) return -1
    return 1
}
