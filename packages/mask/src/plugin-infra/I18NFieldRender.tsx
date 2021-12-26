import type { I18NFieldOrReactNode, I18NStringField } from '@masknet/plugin-infra'
import { useTranslation } from 'react-i18next'

export interface PluginI18NFieldRenderProps {
    field: I18NFieldOrReactNode
    pluginID: string
}
export function PluginI18NFieldRender({ pluginID, field }: PluginI18NFieldRenderProps) {
    const [t] = useTranslation()
    if (!field) return null
    if (typeof field === 'object' && 'fallback' in field) {
        if (field.i18nKey) {
            const translate = t(field.i18nKey, { ns: pluginID, nsSeparator: '%%%', defaultValue: field.fallback })
            return <>{translate}</>
        }
        return <>{field.fallback}</>
    }
    return <>{field}</>
}
export function usePluginI18NField() {
    const [t] = useTranslation()
    return function (pluginID: string, field: I18NStringField) {
        if (!field.i18nKey) return field.fallback
        if (!field.i18nKey.startsWith('__')) {
            /**
             * This field is used in the definition of a plugin in form of
             * { fallback: "Text", i18nKey: "name" }
             *
             * Which is highly not likely to be analyzed by the type system.
             * Enforce those key to starts with __, we can exclude those keys
             * from the unused key result to keep the functionality of the analyzer.
             */
            console.warn(
                `[@masknet/plugin-infra] Plugin ${pluginID} uses i18n key ${field.i18nKey}. Please change it to __${field.i18nKey}.`,
            )
            return field.fallback
        }
        return t(field.i18nKey, { ns: pluginID, nsSeparator: '%%%', defaultValue: field.fallback })
    }
}
