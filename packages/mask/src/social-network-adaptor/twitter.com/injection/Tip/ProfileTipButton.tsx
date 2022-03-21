import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useState, useEffect } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { TipButton } from '../../../../plugins/NextID/components/tip/TipButton'
import { startWatch, createReactRootShadowed } from '../../../../utils'
import { useLocationChange } from '../../../../utils/hooks/useLocationChange'
import {
    profileMenuButtonSelector as menuButtonSelector,
    profileButtonNextToMenuButtonSelector as selector,
} from '../../utils/selector'

export function injectOpenTipButtonOnProfile(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { signal }).render(<OpenTipDialog />)
}

interface StyleProps {
    minHeight: number
    fontSize: number
    marginBottom: number
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    button: {
        height: 34,
        paddingLeft: theme.spacing(1.5),
        paddingRight: theme.spacing(1.5),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #536471',
        borderRadius: 999,
        marginRight: theme.spacing(1),
        marginBottom: props.marginBottom,
        verticalAlign: 'top',
        color: theme.palette.text.primary,
    },
    label: {
        fontSize: 14,
        marginLeft: theme.spacing(0.5),
    },
}))

function OpenTipDialog() {
    const [style, setStyle] = useState<StyleProps>({ minHeight: 32, fontSize: 14, marginBottom: 11 })
    const visitingPersona = useCurrentVisitingIdentity()

    const setStyleFromEditProfileSelector = () => {
        const menuButton = menuButtonSelector().evaluate()
        if (!menuButton) return
        const css = window.getComputedStyle(menuButton)
        setStyle({
            minHeight: Number(css.minHeight.replace('px', '')),
            fontSize: Number(css.fontSize.replace('px', '')),
            marginBottom: Number(css.marginBottom.replace('px', '')),
        })
    }

    useEffect(setStyleFromEditProfileSelector, [])

    useLocationChange(setStyleFromEditProfileSelector)

    const { classes } = useStyles(style)
    return (
        <TipButton className={classes.button} receiver={visitingPersona.identifier}>
            <span className={classes.label}>Tips</span>
        </TipButton>
    )
}
