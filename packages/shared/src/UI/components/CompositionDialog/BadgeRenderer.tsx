import { useActivatedPluginsSiteAdaptor, type Plugin, usePluginTransField } from '@masknet/plugin-infra/content-script'
import { makeStyles, ShadowRootTooltip } from '@masknet/theme'
import type { TypedMessage } from '@masknet/typed-message'
import { Box, Chip } from '@mui/material'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    chip: {
        maxWidth: 500,
        background: theme.palette.background.paper,
        boxShadow: `0px 0px 20px 0px ${theme.palette.mode === 'dark' ? '#FFFFFF1F' : '#0000000D'}`,
    },
}))

interface BadgeRendererProps {
    meta: TypedMessage['meta']
    onDeleteMeta(metaID: string): void
    readonly: boolean
}

export function BadgeRenderer({ meta, onDeleteMeta, readonly }: BadgeRendererProps) {
    const plugins = useActivatedPluginsSiteAdaptor('any')
    const i18n = usePluginTransField()
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

            function normalizeBadgeDescriptor(desc: Plugin.SiteAdaptor.BadgeDescriptor | string | null) {
                if (!desc) return null
                if (typeof desc === 'string')
                    desc = {
                        text: desc,
                        tooltip: <Trans>Provided by plugin "{i18n(plugin.ID, plugin.name)}"</Trans>,
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
    title: React.ReactNode
    onDelete(): void
    readonly: boolean
}

function MetaBadge({ title, children, onDelete, readonly }: React.PropsWithChildren<MetaBadgeProps>) {
    const { classes } = useStyles()
    return (
        <Box sx={{ display: 'inline-block' }}>
            <ShadowRootTooltip title={title ?? ''}>
                <span>
                    <Chip disabled={readonly} onDelete={onDelete} label={children} className={classes.chip} />
                </span>
            </ShadowRootTooltip>
        </Box>
    )
}
