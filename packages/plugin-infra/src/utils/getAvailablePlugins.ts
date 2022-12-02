import type { Plugin } from '../types.js'

export function getAvailablePlugins<T extends Pick<Plugin.Shared.Definition, 'enableRequirement'>, R = T>(
    plugins: readonly T[],
    producer?: (plugins: readonly T[]) => R[],
) {
    return (producer ? producer(plugins) : plugins) as R[]
}
