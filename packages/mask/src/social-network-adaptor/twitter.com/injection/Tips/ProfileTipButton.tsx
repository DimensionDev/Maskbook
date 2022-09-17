import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { makeStyles } from '@masknet/theme'
import { useEffect, useMemo, useState } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { createReactRootShadowed, startWatch, useLocationChange } from '../../../../utils/index.js'
import {
    profileFollowButtonSelector as selector,
    profileMenuButtonSelector as menuButtonSelector,
} from '../../utils/selector.js'

export function injectOpenTipsButtonOnProfile(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { signal }).render(<ProfileTipsSlot />)
}

interface StyleProps {
    size: number
    marginBottom: number
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    slot: {
        position: 'relative',
        height: props.size,
        width: props.size,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.mode === 'dark' ? '#536471' : '#d2dbe0',
        borderRadius: 999,
        marginRight: theme.spacing(1),
        marginBottom: props.marginBottom,
        verticalAlign: 'top',
        color: theme.palette.text.primary,
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(239,243,244,0.1)' : 'rgba(15,20,25,0.1)',
        },
    },
}))

function useTipsSlotStyles() {
    const [style, setStyle] = useState<StyleProps>({ size: 34, marginBottom: 11 })
    const setStyleFromEditProfileSelector = () => {
        const menuButton = menuButtonSelector().evaluate()
        if (!menuButton) return
        const css = window.getComputedStyle(menuButton)
        setStyle({
            size: Number.parseFloat(css.height.replace('px', '')),
            marginBottom: Number.parseFloat(css.marginBottom.replace('px', '')),
        })
    }
    useEffect(setStyleFromEditProfileSelector, [])

    useLocationChange(setStyleFromEditProfileSelector)
    return useStyles(style)
}

function ProfileTipsSlot() {
    const visitingPersona = useCurrentVisitingIdentity()
    const { classes } = useTipsSlotStyles()
    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.TipsRealm?.UI?.Content,
        )

        return <Component identity={visitingPersona.identifier} slot={Plugin.SNSAdaptor.TipsSlot.Profile} />
    }, [visitingPersona.identifier])

    if (!component || !visitingPersona.identifier) return null

    return <span className={classes.slot}>{component}</span>
}
