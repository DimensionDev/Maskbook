import { ValueRef } from '@dimensiondev/holoflows-kit'
import { PluginITO_RPC } from '../messages'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { JSON_PayloadInMask } from '../types'

let storage = new Map<string, ValueRef<JSON_PayloadInMask>>()
let isLoading = true

export function usePoolPayload(pid: string) {
    if (isLoading) throw suspender(pid)
    return {
        payload: useValueRef(storage.get(pid)!),
        retry: () => retry(pid),
    }
}

async function retry(pid: string) {
    isLoading = true
    if (isLoading) throw suspender(pid)
    return
}

async function suspender(pid: string) {
    try {
        storage.set(pid, new ValueRef(await PluginITO_RPC.getPool(pid)))
        setTimeout(() => (isLoading = false), 0)
    } catch (error) {
        throw error
    }
}
