import { useActivatedPluginsSNSAdaptor, Plugin, I18NStringField } from '@masknet/plugin-infra'
import type { TypedMessage } from '@masknet/shared-base'
import { Box, Tooltip, Chip } from '@material-ui/core'
import { usePluginI18NField } from '../../plugin-infra/I18NFieldRender'

export interface BadgeRendererProps {
    meta: TypedMessage['meta']
    onDeleteMeta(metaID: string): void
    readonly: boolean
}

export function BadgeRenderer({ meta, onDeleteMeta, readonly }: BadgeRendererProps) {
    const plugins = useActivatedPluginsSNSAdaptor()
    const i18n = usePluginI18NField()
    if (!meta) return null
    const result = [...meta.entries()].flatMap(([metaKey, metaValue]) => {
        return plugins.map((plugin) => {
            const render = plugin.CompositionDialogMetadataBadgeRender
            if (!render) return null

            try {
                if (typeof render === 'function') {
                    return normalizeBadgeDescriptor(
                        metaKey,
                        plugin,
                        render(metaKey, metaValue),
                        i18n,
                        onDeleteMeta,
                        readonly,
                    )
                } else {
                    const f = render.get(metaKey)
                    if (!f) return null
                    return normalizeBadgeDescriptor(metaKey, plugin, f(metaValue), i18n, onDeleteMeta, readonly)
                }
            } catch (error) {
                console.error(error)
                return null
            }
        })
    })
    return <>{result}</>
}
function normalizeBadgeDescriptor(
    meta: string,
    plugin: Plugin.SNSAdaptor.Definition,
    desc: Plugin.SNSAdaptor.BadgeDescriptor | string | null,
    i18n: (id: string, field: I18NStringField) => string,
    remove: BadgeRendererProps['onDeleteMeta'],
    readonly: boolean,
) {
    if (!desc) return null
    if (typeof desc === 'string') desc = { text: desc, tooltip: `Provided by plugin "${i18n(plugin.ID, plugin.name)}"` }
    return (
        <MetaBadge
            readonly={readonly}
            key={meta + ';' + plugin.ID}
            title={desc.tooltip || ''}
            onDelete={() => remove(meta)}>
            {desc.text}
        </MetaBadge>
    )
}
interface MetaBadgeProps {
    title: React.ReactChild
    onDelete(): void
    readonly: boolean
}

function MetaBadge({ title, children, onDelete, readonly }: React.PropsWithChildren<MetaBadgeProps>) {
    return (
        <Box sx={{ marginRight: 1, marginTop: 1, display: 'inline-block' }}>
            <Tooltip title={title}>
                <span>
                    <Chip disabled={readonly} onDelete={onDelete} label={children} />
                </span>
            </Tooltip>
        </Box>
    )
}
