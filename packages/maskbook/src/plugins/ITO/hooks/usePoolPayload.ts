import { ValueRef } from '@dimensiondev/holoflows-kit'
import { PluginITO_RPC } from '../messages'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { JSON_PayloadInMask } from '../types'

let payloadRef = new ValueRef<JSON_PayloadInMask | null>(null)
let isLoading = true

export function usePoolPayload(pid: string) {
    if (isLoading) throw suspender(pid)
    return {
        payload: useValueRef(payloadRef)!,
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
        payloadRef.value = await PluginITO_RPC.getPool(pid)
        setTimeout(() => (isLoading = false), 0)
    } catch (error) {
        throw error
    }
}
