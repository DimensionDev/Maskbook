import { usePersonaProofs } from '@masknet/shared'
import { activatedSiteAdaptorUI } from '../../../../site-adaptor-infra/ui.js'

export function useConnectedVerified(pubkey: string | undefined, userId: string) {
    const { data: proofs, isLoading } = usePersonaProofs(pubkey)
    const platform = activatedSiteAdaptorUI!.configuration.nextIDConfig?.platform
    const checking = isLoading
    if (!platform || !proofs?.length) return [checking, false]
    const verified = proofs.some((x) => x.platform === platform && x.identity === userId.toLowerCase() && x.is_valid)
    return [checking, verified] as const
}
