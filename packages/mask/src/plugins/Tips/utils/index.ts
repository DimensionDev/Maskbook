import type { NextIDPersonaBindings } from '@masknet/shared-base'
import formatDateTime from 'date-fns/format'
import { sortBy } from 'lodash-unified'

export const getNowTime = () => formatDateTime(new Date(), 'yyyy-MM-dd HH:mm')

export function getLatestBinding(bindings: NextIDPersonaBindings[]) {
    const sorted = sortBy(bindings, (b) => {
        const latestTimestamp = b.proofs.map((p) => Number.parseInt(p.created_at, 10)).sort((p1, p2) => p2 - p1)[0] ?? 0
        return -latestTimestamp
    })
    return sorted[0]
}
