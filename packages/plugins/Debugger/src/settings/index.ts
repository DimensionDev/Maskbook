import type { Plugin } from '@masknet/plugin-infra'
import { createValueRefWithReady } from '@masknet/shared-base'

export const SharedContextSettings = createValueRefWithReady<Plugin.SNSAdaptor.SNSAdaptorContext>(null!)
