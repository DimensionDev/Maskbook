import type { Plugin } from '@masknet/plugin-infra'
export let context: Plugin.Dashboard.DashboardContext
export function setupContext(x: typeof context) {
    context = x
}
