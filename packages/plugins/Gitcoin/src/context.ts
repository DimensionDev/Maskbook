import type { Plugin } from '@masknet/plugin-infra/content-script'
import { createValueRefWithReady } from '@masknet/shared-base'
export const SharedContextSettings = createValueRefWithReady<Plugin.SNSAdaptor.SNSAdaptorContext>(null!)
export let context: Plugin.SNSAdaptor.SNSAdaptorContext
export function setupContext(x: typeof context) {
    context = x
}
