import { createValueRefWithReady } from '@masknet/shared-base'
import type { Plugin } from '@masknet/plugin-infra/content-script'

export const SharedContextSettings = createValueRefWithReady<Plugin.SNSAdaptor.SNSAdaptorContext>(null!)
