import { type ReactNode, useCallback } from 'react'
import { useAsync } from 'react-use'
import type { Option } from 'ts-results-es'
import { useSubscription } from 'use-subscription'
import { Icons } from '@masknet/icons'
import {
    type Plugin,
    PluginTransFieldRender,
    registeredPlugins,
    useActivatedPluginsSiteAdaptor,
    usePostInfoDetails,
} from '@masknet/plugin-infra/content-script'
import { MaskPostExtraInfoWrapper } from '@masknet/shared'
import { BooleanPreference, EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles, MaskLightTheme } from '@masknet/theme'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { Box, type BoxProps, Button, Skeleton, Typography, useTheme } from '@mui/material'
import Services from '#services'
import { Trans } from '@lingui/macro'

function useDisabledPlugins() {
    const activated = new Set<string>(useActivatedPluginsSiteAdaptor('any').map((x) => x.ID))
    const minimalMode = new Set<string>(useActivatedPluginsSiteAdaptor(true).map((x) => x.ID))
    const disabledPlugins = useSubscription(registeredPlugins)
        .filter((plugin) => !activated.has(plugin[0]) || minimalMode.has(plugin[0]))
        .map((x) => x[1])
    return disabledPlugins
}

export function useDisabledPluginSuggestionFromPost(postContent: Option<string>, metaLinks: readonly string[]) {
    const disabled = useDisabledPlugins().filter((x) => x.contribution?.postContent)

    const matches = disabled.filter((x) => {
        for (const pattern of x.contribution!.postContent!) {
            if (postContent.isSome() && postContent.value.match(pattern)) return true
            if (metaLinks.some((link) => link.match(pattern))) return true
        }
        return false
    })
    return matches
}

export function useDisabledPluginSuggestionFromMeta(meta: undefined | ReadonlyMap<string, unknown>) {
    const disabled = useDisabledPlugins().filter((x) => x.contribution?.metadataKeys)

    if (!meta) return EMPTY_LIST

    const matches = disabled.filter((x) => {
        const contributes = x.contribution!.metadataKeys!
        return [...meta.keys()].some((key) => contributes.has(key))
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
    const _plugins = useActivatedPluginsSiteAdaptor('any')
    if (!plugins.length) return null
    return (
        <>
            {plugins.map((define) => (
                <PossiblePluginSuggestionUISingle
                    define={define}
                    key={define.ID}
                    wrapperProps={_plugins.find((y) => y.ID === define.ID)?.wrapperProps}
                />
            ))}
        </>
    )
}

export function PossiblePluginSuggestionUISingle(props: {
    lackHostPermission?: boolean
    define: Plugin.Shared.Definition
    wrapperProps?: Plugin.SiteAdaptor.PluginWrapperProps | undefined
    content?: ReactNode
}) {
    const { define, lackHostPermission, wrapperProps, content } = props
    const theme = useTheme()
    const onClick = useCallback(() => {
        if (lackHostPermission && define.enableRequirement.host_permissions) {
            Services.Helper.requestExtensionPermissionFromContentScript({
                origins: define.enableRequirement.host_permissions,
            })
        } else {
            Services.Settings.setPluginMinimalModeEnabled(define.ID, false)
        }
    }, [lackHostPermission, define])

    const { value: disabled } = useAsync(async () => {
        const status = await Services.Settings.getPluginMinimalModeEnabled(define.ID)
        return status === BooleanPreference.True
    }, [define.ID])

    const ButtonIcon = lackHostPermission ? Icons.Approve : Icons.Plugin
    const wrapperContent = content ?? <FallbackContent disabled={disabled} height={74} />
    const buttonLabel = lackHostPermission ? <Trans>Approve</Trans> : <Trans>Enable the plugin</Trans>

    return (
        <MaskPostExtraInfoWrapper
            ID={props.define.ID}
            open
            title={<PluginTransFieldRender field={define.name} pluginID={define.ID} />}
            publisher={
                define.publisher ?
                    <PluginTransFieldRender pluginID={define.ID} field={define.publisher.name} />
                :   undefined
            }
            publisherLink={define.publisher?.link}
            wrapperProps={wrapperProps}
            action={
                <Button
                    size="small"
                    startIcon={<ButtonIcon size={18} sx={{ lineHeight: 1 }} />}
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
                    {buttonLabel}
                </Button>
            }
            content={wrapperContent}
        />
    )
}

const useStyles = makeStyles()(() => ({
    content: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    text: {
        color: MaskLightTheme.palette.maskColor.main,
    },
    rectangle: {
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
}))

interface FallbackContentProps extends BoxProps {
    disabled?: boolean
}

function FallbackContent({ disabled, ...rest }: FallbackContentProps) {
    const { classes, cx } = useStyles()
    if (disabled)
        return (
            <Box component="div" {...rest} className={cx(classes.content, rest.className)}>
                <Typography className={classes.text}>
                    <Trans>You need to open the dApp to view the specific content.</Trans>
                </Typography>
            </Box>
        )
    return (
        <Box component="div" pl={1} {...rest} className={cx(classes.content, rest.className)}>
            <Skeleton className={classes.rectangle} variant="text" animation={false} width={103} height={16} />
            <Skeleton className={classes.rectangle} variant="text" animation={false} width={68} height={16} />
            <Skeleton className={classes.rectangle} variant="text" animation={false} width={48} height={16} />
        </Box>
    )
}
