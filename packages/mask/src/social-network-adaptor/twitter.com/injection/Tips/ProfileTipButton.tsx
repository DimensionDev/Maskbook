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
    hide: {
        display: 'none',
    },
    slot: {
        position: 'relative',
        height: props.size,
        width: props.size,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
        marginRight: theme.spacing(1),
        marginBottom: props.marginBottom,
        verticalAlign: 'top',
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
    const { classes, cx } = useTipsSlotStyles()
    const [disabled, setDisabled] = useState(true)
    const iconSize = useMemo(() => {
        const svg = menuButtonSelector().querySelector('svg').evaluate()
        if (!svg) return 24

        const svgCss = window.getComputedStyle(svg)
        return Number.parseFloat(svgCss.width.replace('px', ''))
    }, [location])

    const buttonSize = useMemo(() => {
        const button = menuButtonSelector().querySelector('div').evaluate()
        if (!button) return 34
        const buttonCss = window.getComputedStyle(button)
        return Number.parseFloat(buttonCss.height.replace('px', ''))
    }, [location])
    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.TipsRealm?.UI?.Content,
        )

        return (
            <Component
                identity={visitingPersona.identifier}
                slot={Plugin.SNSAdaptor.TipsSlot.Profile}
                iconSize={iconSize}
                buttonSize={buttonSize}
                onStatusUpdate={setDisabled}
            />
        )
    }, [visitingPersona.identifier])

    if (!component || !visitingPersona.identifier) return null

    return <span className={cx(classes.slot, disabled ? classes.hide : null)}>{component}</span>
}
