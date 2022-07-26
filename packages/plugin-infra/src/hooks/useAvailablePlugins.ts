import type { Plugin } from '../types'

type HasRequirement = { enableRequirement: Plugin.Shared.Definition['enableRequirement'] }

export function useAvailablePlugins<T extends HasRequirement, R extends unknown = T>(
    plugins: T[],
    producer?: (plugins: T[]) => R[],
) {
    return (producer ? producer(plugins) : plugins) as R[]
}
