import { ValueRefWithReady } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import type { Plugin } from '../types.js'

export const SiteAdaptorContextRef = new ValueRefWithReady<
    Omit<Plugin.SiteAdaptor.SiteAdaptorContext, 'createKVStorage' | 'setWeb3State' | 'setMinimalMode'>
>()

export function useSiteAdaptorContext() {
    return useValueRef(SiteAdaptorContextRef)
}
