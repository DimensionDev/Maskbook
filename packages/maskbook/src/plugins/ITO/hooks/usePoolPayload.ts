import { useState } from 'react'
import { PluginITO_RPC } from '../messages'
import type { JSON_PayloadInMask } from '../types'

const storage = new Map<string, JSON_PayloadInMask>()

export function usePoolPayload(pid: string) {
    const [e, set] = useState<Error | null>(null)

    const payload = storage.get(pid)
    if (payload) {
        return {
            payload,
            retry: () => {
                storage.delete(pid)
                throw suspender(pid).catch(set)
            },
        }
    }
    if (e) throw e
    throw suspender(pid).catch(set)
}

async function suspender(pid: string) {
    storage.set(pid, await PluginITO_RPC.getPool(pid))
}
