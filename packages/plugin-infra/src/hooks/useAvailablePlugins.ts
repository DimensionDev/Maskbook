import type { Plugin } from '../types'

type HasRequirement = { enableRequirement: Plugin.Shared.Definition['enableRequirement'] }

export function useAvailablePlugins<T extends HasRequirement>(plugins: T[]) {
    return plugins
}
