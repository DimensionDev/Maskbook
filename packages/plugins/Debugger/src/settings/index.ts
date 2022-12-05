import type { Plugin } from '@masknet/plugin-infra'
import { ValueRefWithReady } from '@masknet/shared-base'

export const SharedContextSettings = new ValueRefWithReady<Plugin.SNSAdaptor.SNSAdaptorContext>()
