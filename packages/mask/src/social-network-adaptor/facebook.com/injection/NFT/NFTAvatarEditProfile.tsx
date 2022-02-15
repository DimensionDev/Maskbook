import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchFacebookEditProfileSelector, searchFacebookProfileSettingButtonSelector } from '../../utils/selector'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { useEffect, useState } from 'react'
import { useLocationChange } from '../../../../utils/hooks/useLocationChange'
import { NFTAvatarButton } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarButton'
import { makeStyles } from '@masknet/theme'

export function injectOpenNFTAvatarEditProfileButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchFacebookProfileSettingButtonSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { signal }).render(
        <OpenNFTAvatarEditProfileButtonInFaceBook />,
    )
}

interface StyleProps {
    minHeight: number
    fontSize: number
    marginTop: number
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        minHeight: props.minHeight,
        fontSize: props.fontSize,
        marginTop: props.marginTop,
        marginRight: theme.spacing(0.5),
        borderRadius: 6,
        border: 'none',
    },
}))

function OpenNFTAvatarEditProfileButtonInFaceBook() {
    const [style, setStyle] = useState<StyleProps>({ minHeight: 36, fontSize: 15, marginTop: 6 })
    const onClick = () => {
        const editDom = searchFacebookEditProfileSelector().evaluate()
        editDom?.click()
    }

    const setStyleWithSelector = () => {
        const editDom = searchFacebookProfileSettingButtonSelector().evaluate()

        if (!editDom) return

        const buttonDom = editDom.querySelector('div > div')

        if (!buttonDom) return

        const editCss = window.getComputedStyle(editDom)
        const buttonCss = window.getComputedStyle(buttonDom)
        setStyle({
            fontSize: Number(editCss.fontSize.replace('px', '')),
            marginTop: Number(editCss.paddingTop.replace('px', '')),
            minHeight: Number(buttonCss.height.replace('px', '')),
        })
    }
    useEffect(setStyleWithSelector, [])

    useLocationChange(setStyleWithSelector)

    const { classes } = useStyles(style)

    return <NFTAvatarButton classes={classes} onClick={onClick} />
}
