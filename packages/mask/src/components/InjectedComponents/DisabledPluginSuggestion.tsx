import type { Option } from 'ts-results'
import {
    useActivatedPluginsSNSAdaptor,
    registeredPlugins,
    usePostInfoDetails,
    Plugin,
    PluginI18NFieldRender,
} from '@masknet/plugin-infra/content-script'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import Services from '../../extension/service'
import MaskPostExtraInfoWrapper from '../../plugins/MaskPluginWrapper'
import { HTMLProps, useCallback } from 'react'
import { Button } from '@mui/material'
import { PluginIcon } from '@masknet/icons'
import { makeStyles, MaskColorVar } from '@masknet/theme'

function useDisabledPlugins() {
    const activated = new Set(useActivatedPluginsSNSAdaptor('any').map((x) => x.ID))
    const minimalMode = new Set(useActivatedPluginsSNSAdaptor(true).map((x) => x.ID))
    const disabledPlugins = [...registeredPlugins].filter((x) => !activated.has(x.ID) || minimalMode.has(x.ID))
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
export function PossiblePluginSuggestionUI(props: { plugins: Plugin.DeferredDefinition[] }) {
    const { plugins } = props
    const onClick = useCallback((x: Plugin.DeferredDefinition) => {
        Services.Settings.setPluginMinimalModeEnabled(x.ID, false)
    }, [])
    const _plugins = useActivatedPluginsSNSAdaptor('any')
    if (!plugins.length) return null

    return (
        <>
            {plugins.map((x) => (
                <MaskPostExtraInfoWrapper
                    open
                    key={x.ID}
                    title={<PluginI18NFieldRender field={x.name} pluginID={x.ID} />}
                    publisher={
                        x.publisher ? <PluginI18NFieldRender pluginID={x.ID} field={x.publisher.name} /> : undefined
                    }
                    publisherLink={x.publisher?.link}
                    wrapperProps={_plugins.filter((y) => y.ID === x.ID)?.[0]?.wrapperProps}
                    action={
                        <Button
                            size="small"
                            startIcon={<PluginIcon />}
                            variant="contained"
                            onClick={() => onClick(x)}
                            sx={{
                                backgroundColor: MaskColorVar.buttonPluginBackground,
                                color: 'white',
                                width: '254px',
                                '&:hover': {
                                    backgroundColor: MaskColorVar.buttonPluginBackground,
                                },
                                borderRadius: 9999,
                            }}>
                            Enable plugins
                        </Button>
                    }
                    content={<Rectangle style={{ paddingLeft: 8, marginBottom: 4 }} />}
                />
            ))}
        </>
    )
}

const useRectangleStyles = makeStyles()(() => ({
    rectangle: {
        height: 8,
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 8,
    },
}))
interface RectangleProps extends HTMLProps<HTMLDivElement> {}

export function Rectangle(props: RectangleProps) {
    const { classes } = useRectangleStyles()
    return (
        <div {...props}>
            <div className={classes.rectangle} style={{ width: 103 }} />
            <div className={classes.rectangle} style={{ width: 68, marginTop: 4 }} />
            <div className={classes.rectangle} style={{ width: 48, marginTop: 4 }} />
        </div>
    )
}
