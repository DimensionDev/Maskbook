import type { Plugin } from '@masknet/plugin-infra'
import { ValueRefWithReady } from '@masknet/shared-base'

export let context: Plugin.SNSAdaptor.SNSAdaptorContext

export function setupContext(x: typeof context) {
    context = x
}

export const SharedContextSettings = new ValueRefWithReady<Plugin.SNSAdaptor.SNSAdaptorContext>()
