import { useActivatedPluginsSNSAdaptor, Plugin } from '@masknet/plugin-infra'
import type { TypedMessage } from '@masknet/shared-base'
import { Box, Chip } from '@mui/material'
import { usePluginI18NField } from '../../plugin-infra/I18NFieldRender'
import { ShadowRootTooltip } from '../../utils'

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
                    return normalizeBadgeDescriptor(render(metaKey, metaValue))
                } else {
                    const f = render.get(metaKey)
                    if (!f) return null
                    return normalizeBadgeDescriptor(f(metaValue))
                }
            } catch (error) {
                console.error(error)
                return null
            }

            function normalizeBadgeDescriptor(desc: Plugin.SNSAdaptor.BadgeDescriptor | string | null) {
                if (!desc) return null
                if (typeof desc === 'string')
                    desc = { text: desc, tooltip: `Provided by plugin "${i18n(plugin.ID, plugin.name)}"` }
                return (
                    <MetaBadge
                        readonly={readonly}
                        key={metaKey + ';' + plugin.ID}
                        title={desc.tooltip || ''}
                        onDelete={() => onDeleteMeta(metaKey)}>
                        {desc.text}
                    </MetaBadge>
                )
            }
        })
    })
    return <>{result}</>
}
interface MetaBadgeProps {
    title: React.ReactChild
    onDelete(): void
    readonly: boolean
}

function MetaBadge({ title, children, onDelete, readonly }: React.PropsWithChildren<MetaBadgeProps>) {
    return (
        <Box sx={{ marginRight: 1, marginTop: 1, display: 'inline-block' }}>
            <ShadowRootTooltip title={title}>
                <span>
                    <Chip disabled={readonly} onDelete={onDelete} label={children} />
                </span>
            </ShadowRootTooltip>
        </Box>
    )
}
