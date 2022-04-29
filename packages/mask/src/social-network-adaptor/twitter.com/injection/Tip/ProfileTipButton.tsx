import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useEffect, useState } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { TipButton } from '../../../../plugins/Tips/components'
import { createReactRootShadowed, startWatch, useLocationChange } from '../../../../utils'
import {
    profileFollowButtonSelector as selector,
    profileMenuButtonSelector as menuButtonSelector,
} from '../../utils/selector'

export function injectOpenTipButtonOnProfile(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { signal }).render(<OpenTipDialog />)
}

interface StyleProps {
    size: number
    fontSize: number
    marginBottom: number
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    button: {
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
    label: {
        fontSize: 14,
        marginLeft: theme.spacing(0.5),
    },
}))

function OpenTipDialog() {
    const [style, setStyle] = useState<StyleProps>({ size: 34, fontSize: 14, marginBottom: 11 })
    const visitingPersona = useCurrentVisitingIdentity()

    const setStyleFromEditProfileSelector = () => {
        const menuButton = menuButtonSelector().evaluate()
        if (!menuButton) return
        const css = window.getComputedStyle(menuButton)
        setStyle({
            size: Number.parseFloat(css.height.replace('px', '')),
            fontSize: Number.parseFloat(css.fontSize.replace('px', '')),
            marginBottom: Number.parseFloat(css.marginBottom.replace('px', '')),
        })
    }

    useEffect(setStyleFromEditProfileSelector, [])

    useLocationChange(setStyleFromEditProfileSelector)

    const { classes } = useStyles(style)
    return <TipButton className={classes.button} receiver={visitingPersona.identifier} />
}
