import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchInstagramAvatarSelector, searchInstagramProfileSettingButtonSelector } from '../../utils/selector'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { useCallback, useLayoutEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { NFTAvatarButton } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarButton'
import { useLocationChange } from '../../../../utils/hooks/useLocationChange'
import { Theme, useMediaQuery } from '@mui/material'

export function injectOpenNFTAvatarEditProfileButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchInstagramProfileSettingButtonSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <OpenNFTAvatarEditProfileButtonInInstagram />,
    )
}

interface StyleProps {
    fontSize: number
    marginLeft: number
    minHeight: number
    borderRadius: number
    border: string
    background: string
    color: string
    marginTop?: number
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        ...props,
    },
}))

function OpenNFTAvatarEditProfileButtonInInstagram() {
    const [style, setStyle] = useState<StyleProps>({
        fontSize: 15,
        marginLeft: 0,
        minHeight: 30,
        borderRadius: 4,
        border: '',
        background: 'transparent',
        color: '#000',
    })

    const mediaQuery = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))

    const onClick = useCallback(() => {
        const editDom = searchInstagramAvatarSelector().evaluate()

        editDom?.click()
    }, [])

    const setStyleWithSelector = useCallback(() => {
        const editDom = searchInstagramProfileSettingButtonSelector().evaluate()

        if (!editDom) return

        const buttonDom = editDom.querySelector('a')

        if (!buttonDom) return

        const editCss = window.getComputedStyle(editDom)
        const buttonCss = window.getComputedStyle(buttonDom)

        setStyle({
            minHeight: Number(buttonCss.height.replace('px', '')),
            fontSize: Number(buttonCss.fontSize.replace('px', '')),
            marginLeft: Number(editCss.marginLeft.replace('px', '')),
            borderRadius: Number(buttonCss.borderRadius.replace('px', '')),
            border: buttonCss.border,
            background: buttonCss.background,
            color: buttonCss.color,
            marginTop: mediaQuery ? 20 : 0,
        })
    }, [mediaQuery])

    useLayoutEffect(setStyleWithSelector, [])

    useLocationChange(setStyleWithSelector)

    const { classes } = useStyles(style)

    return <NFTAvatarButton onClick={onClick} classes={classes} />
}
