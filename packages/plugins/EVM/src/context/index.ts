import { defer } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'

let context: Plugin.Shared.SharedContext = null!
let [promise, resolve] = defer<void>()

export function setupSharedContext(sharedContext: Plugin.Shared.SharedContext) {
    setSharedContext(sharedContext)
    return context
}

export function untilSharedContext() {
    return promise
}

export function getSharedContext() {
    if (!context) throw new Error('Please setup context at first.')
    return context
}

export async function setSharedContext(newContext: Plugin.Shared.SharedContext) {
    context = newContext
    resolve()
}
