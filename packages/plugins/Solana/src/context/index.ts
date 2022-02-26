import type { Plugin } from '@masknet/plugin-infra'

let context: Plugin.Shared.SharedContext = null!

export function setupSharedContext(sharedContext: Plugin.Shared.SharedContext) {
    context = sharedContext
}

export function getSharedContext() {
    if (!context) throw new Error('Please setup context at first.')
    return context
}

export async function setSharedContext(newContext: Plugin.Shared.SharedContext) {
    context = newContext
}
