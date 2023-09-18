import type { Plugin } from '@masknet/plugin-infra'
import { ValueRefWithReady } from '@masknet/shared-base'

export const SiteAdaptorContextRef = new ValueRefWithReady<Plugin.SiteAdaptor.SiteAdaptorContext>()
