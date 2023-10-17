import { usePersonaProofs } from '@masknet/shared'
import { activatedSiteAdaptorUI } from '../../../../site-adaptor-infra/ui.js'

export function useConnectedVerified(pubkey: string | undefined, userId: string) {
    const { data: proofs } = usePersonaProofs(pubkey)
    const platform = activatedSiteAdaptorUI!.configuration.nextIDConfig?.platform
    if (!platform || !proofs?.length) return false
    return proofs.some((x) => x.platform === platform && x.identity === userId && x.is_valid)
}
