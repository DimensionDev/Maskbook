import type { Plugin } from '../types.js'

export function getAvailablePlugins<T extends Pick<Plugin.Shared.Definition, 'enableRequirement'>, R = T>(
    plugins: T[],
    producer?: (plugins: T[]) => R[],
) {
    return (producer ? producer(plugins) : plugins) as R[]
}
