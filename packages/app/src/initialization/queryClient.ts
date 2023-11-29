import { queryClient } from '@masknet/shared-base-ui'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

export function initQueryClient() {
    broadcastQueryClient({ queryClient })
}
