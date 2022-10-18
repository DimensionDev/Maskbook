import { ReactNode, useCallback } from 'react'
import type { Option } from 'ts-results'
import {
    useActivatedPluginsSNSAdaptor,
    registeredPlugins,
    usePostInfoDetails,
    Plugin,
    PluginI18NFieldRender,
} from '@masknet/plugin-infra/content-script'
import { MaskPostExtraInfoWrapper } from '@masknet/shared'
import { Box, BoxProps, Button, Skeleton, useTheme } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import Services from '../../extension/service.js'
import { useI18N } from '../../utils/index.js'
import { useSubscription } from 'use-subscription'

function useDisabledPlugins() {
    const activated = new Set(useActivatedPluginsSNSAdaptor('any').map((x) => x.ID))
    const minimalMode = new Set(useActivatedPluginsSNSAdaptor(true).map((x) => x.ID))
    const disabledPlugins = useSubscription(registeredPlugins)
        .filter((plugin) => !activated.has(plugin[0]) || minimalMode.has(plugin[0]))
        .map((x) => x[1])
    return disabledPlugins
}

export function useDisabledPluginSuggestionFromPost(postContent: Option<string>, metaLinks: string[]) {
    const disabled = useDisabledPlugins().filter((x) => x.contribution?.postContent)

    const { some } = postContent
    const matches = disabled.filter((x) => {
        for (const pattern of x.contribution!.postContent!) {
            if (some && postContent.val.match(pattern)) return true
            if (metaLinks.some((link) => link.match(pattern))) return true
        }
        return false
    })
    return matches
}

export function useDisabledPluginSuggestionFromMeta(meta: undefined | ReadonlyMap<string, unknown>) {
    const disabled = useDisabledPlugins().filter((x) => x.contribution?.metadataKeys)
    if (!meta) return []
    const keys = [...meta.keys()]

    const matches = disabled.filter((x) => {
        const contributes = x.contribution!.metadataKeys!
        return keys.some((key) => contributes.has(key))
    })
    return matches
}

export function PossiblePluginSuggestionPostInspector() {
    const message = extractTextFromTypedMessage(usePostInfoDetails.rawMessage())
    const metaLinks = usePostInfoDetails.mentionedLinks()
    const matches = useDisabledPluginSuggestionFromPost(message, metaLinks)
    return <PossiblePluginSuggestionUI plugins={matches} />
}
export function PossiblePluginSuggestionUI(props: { plugins: Plugin.Shared.Definition[] }) {
    const { plugins } = props
    const _plugins = useActivatedPluginsSNSAdaptor('any')
    // const lackPermission = usePluginHostPermissionCheck(plugins)
    if (!plugins.length) return null
    return (
        <>
            {plugins.map((define) => (
                <PossiblePluginSuggestionUISingle
                    define={define}
                    key={define.ID}
                    wrapperProps={_plugins.find((y) => y.ID === define.ID)?.wrapperProps}
                    // lackHostPermission={lackPermission?.has(define.ID)}
                />
            ))}
        </>
    )
}

export function PossiblePluginSuggestionUISingle(props: {
    lackHostPermission?: boolean
    define: Plugin.Shared.Definition
    wrapperProps?: Plugin.SNSAdaptor.PluginWrapperProps | undefined
    content?: ReactNode
}) {
    const { define, lackHostPermission, wrapperProps, content } = props
    const { t } = useI18N()
    const theme = useTheme()
    const onClick = useCallback(() => {
        if (lackHostPermission && define.enableRequirement.host_permissions) {
            Services.Helper.requestHostPermission(define.enableRequirement.host_permissions)
        } else {
            Services.Settings.setPluginMinimalModeEnabled(define.ID, false)
        }
    }, [lackHostPermission, define])

    return (
        <MaskPostExtraInfoWrapper
            open
            title={<PluginI18NFieldRender field={define.name} pluginID={define.ID} />}
            publisher={
                define.publisher ? (
                    <PluginI18NFieldRender pluginID={define.ID} field={define.publisher.name} />
                ) : undefined
            }
            publisherLink={define.publisher?.link}
            wrapperProps={wrapperProps}
            action={
                <Button
                    size="small"
                    startIcon={
                        lackHostPermission ? (
                            <Icons.Approve size={18} sx={{ lineHeight: 1 }} />
                        ) : (
                            <Icons.Plugin size={18} sx={{ lineHeight: 1 }} />
                        )
                    }
                    variant="roundedDark"
                    onClick={onClick}
                    sx={{
                        backgroundColor: theme.palette.maskColor.dark,
                        color: 'white',
                        width: '254px',
                        height: '36px',
                        fontSize: 14,
                        fontWeight: 700,
                        lineHeight: 1.5,
                        '&:hover': {
                            backgroundColor: theme.palette.maskColor.dark,
                        },
                    }}>
                    {lackHostPermission ? t('approve') : t('plugin_enables')}
                </Button>
            }
            content={content ?? <Rectangle style={{ paddingLeft: 8, marginBottom: 42 }} />}
        />
    )
}

const useRectangleStyles = makeStyles()(() => ({
    rectangle: {
        background: 'rgba(255, 255, 255, 0.5)',
    },
}))

export interface RectangleProps extends BoxProps {}

export function Rectangle(props: RectangleProps) {
    const { classes } = useRectangleStyles()
    return (
        <Box component="div" {...props}>
            <Skeleton className={classes.rectangle} variant="text" animation={false} width={103} height={16} />
            <Skeleton className={classes.rectangle} variant="text" animation={false} width={68} height={16} />
            <Skeleton className={classes.rectangle} variant="text" animation={false} width={48} height={16} />
        </Box>
    )
}
