import type { NextIDPersonaBindings } from '@masknet/shared-base'
import { first } from 'lodash-unified'

export const sortPersonaBindings = (a: NextIDPersonaBindings, b: NextIDPersonaBindings, userId: string): number => {
    const p_a = first(a.proofs.filter((x) => x.identity === userId.toLowerCase()))
    const p_b = first(b.proofs.filter((x) => x.identity === userId.toLowerCase()))

    if (!p_a || !p_b) return 0
    if (p_a.created_at > p_b.created_at) return -1
    return 1
}
