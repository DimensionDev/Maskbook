import type { Plugin } from '@masknet/plugin-infra/content-script'
export let context: Plugin.SNSAdaptor.SNSAdaptorContext
export function setupContext(x: typeof context) {
    context = x
}
