import { useActivatedPluginsSNSAdaptor, Plugin, usePluginI18NField } from '@masknet/plugin-infra/content-script'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import type { TypedMessage } from '@masknet/typed-message'
import { Box, Chip } from '@mui/material'
import { useI18N } from '../../utils'

const useStyles = makeStyles()((theme) => ({
    chip: {
        maxWidth: 500,
        background: theme.palette.background.paper,
        boxShadow: `0px 0px 20px 0px ${theme.palette.mode === 'dark' ? '#FFFFFF1F' : '#0000000D'}`,
    },
}))

export interface BadgeRendererProps {
    meta: TypedMessage['meta']
    onDeleteMeta(metaID: string): void
    readonly: boolean
}

export function BadgeRenderer({ meta, onDeleteMeta, readonly }: BadgeRendererProps) {
    const plugins = useActivatedPluginsSNSAdaptor('any')
    const i18n = usePluginI18NField()
    const { t } = useI18N()
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
                    desc = {
                        text: desc,
                        tooltip: `${t('badge_renderer_provided_by_plugin')} "${i18n(plugin.ID, plugin.name)}"`,
                    }
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
    const { classes } = useStyles()
    console.log(title, 'ggg', children)
    return (
        <Box sx={{ display: 'inline-block' }}>
            <ShadowRootTooltip title={title}>
                <span>
                    <Chip disabled={readonly} onDelete={onDelete} label={children} className={classes.chip} />
                </span>
            </ShadowRootTooltip>
        </Box>
    )
}
