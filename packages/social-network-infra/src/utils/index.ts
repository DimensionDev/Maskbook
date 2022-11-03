import { first } from 'lodash-unified'
import type { NextIDPersonaBindings } from '@masknet/shared-base'

/**
 * find latest used persona binding
 */

export const sortPersonaBindings = (a: NextIDPersonaBindings, b: NextIDPersonaBindings, userId?: string): number => {
    if (!userId) return 0

    const p_a = first(a.proofs.filter((x) => x.identity === userId.toLowerCase()))
    const p_b = first(b.proofs.filter((x) => x.identity === userId.toLowerCase()))

    if (!p_a || !p_b) return 0
    if (p_a.last_checked_at > p_b.last_checked_at) return -1
    return 1
}
