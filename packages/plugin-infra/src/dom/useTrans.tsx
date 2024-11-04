import type { I18NFieldOrReactNode, I18NStringField } from '../types.js'

export interface PluginTransFieldRenderProps {
    field: I18NFieldOrReactNode
    pluginID: string
}

export function PluginTransFieldRender({ pluginID, field }: PluginTransFieldRenderProps) {
    if (!field) return null
    if (typeof field === 'object' && 'fallback' in field) {
        return <>{field.fallback}</>
    }
    return <>{field}</>
}
export function usePluginTransField() {
    return function (pluginID: string, field: I18NStringField) {
        return field.fallback
    }
}
