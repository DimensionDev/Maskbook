import { ValueRefWithReady } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra/content-script'

export const SharedContextSettings = new ValueRefWithReady<Plugin.SNSAdaptor.SNSAdaptorContext>()
export const DashboardSharedContextSettings = new ValueRefWithReady<Plugin.Dashboard.DashboardContext>()
