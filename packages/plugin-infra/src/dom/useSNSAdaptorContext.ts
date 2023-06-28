import { useValueRef } from '@masknet/shared'
import { ValueRefWithReady } from '@masknet/shared-base'
import type { Plugin } from '../types.js'

export const SNSAdaptorContextRef = new ValueRefWithReady<
    Omit<Plugin.SNSAdaptor.SNSAdaptorContext, 'createKVStorage'>
>()

export function useSNSAdaptorContext() {
    return useValueRef(SNSAdaptorContextRef)
}
