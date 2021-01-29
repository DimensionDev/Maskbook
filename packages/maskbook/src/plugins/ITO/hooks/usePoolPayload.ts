import { PluginITO_RPC } from '../messages'
import type { JSON_PayloadInMask } from '../types'
import { useUpdate } from 'react-use'
import { unstable_useTransition } from 'react'

const cache = new Map<string, [0, Promise<void>] | [1, JSON_PayloadInMask] | [2, Error]>()
export function poolPayloadErrorRetry() {
    cache.forEach(([status], pid) => status === 2 && cache.delete(pid))
}
export function usePoolPayload(pid: string) {
    const rec = cache.get(pid)
    const forceUpdate = useUpdate()
    const [startTransition] = unstable_useTransition({ busyDelayMs: 1000 })
    if (!rec) {
        const p = suspender(pid)
            .then((val) => void cache.set(pid, [1, val]))
            .catch((e) => void cache.set(pid, [2, e]))
        cache.set(pid, [0, p])
        throw p
    }
    if (rec[0] === 1)
        return {
            payload: rec[1],
            retry: () =>
                startTransition(() => {
                    if (cache.has(pid)) cache.delete(pid)
                    forceUpdate()
                }),
        }
    throw rec[1]
}
async function suspender(pid: string) {
    return PluginITO_RPC.getPool(pid)
}
