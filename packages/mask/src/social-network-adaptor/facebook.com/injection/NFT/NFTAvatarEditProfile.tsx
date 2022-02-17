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
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <OpenNFTAvatarEditProfileButtonInFaceBook />,
    )
}

interface StyleProps {
    minHeight: number
    fontSize: number
    marginTop: number
    backgroundColor?: string
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        minHeight: props.minHeight,
        fontSize: props.fontSize,
        marginTop: props.marginTop,
        backgroundColor: props.backgroundColor,
        marginRight: theme.spacing(0.5),
        borderRadius: 6,
        border: 'none',

        // TODO: Replace with theme color
        color: 'var(--primary-button-text)',
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

        const buttonDom = editDom.querySelector<HTMLDivElement>('a > div')

        if (!buttonDom) return

        const editCss = window.getComputedStyle(editDom)
        const buttonCss = window.getComputedStyle(buttonDom)

        setStyle({
            fontSize: Number(editCss.fontSize.replace('px', '')),
            marginTop: Number(editCss.paddingTop.replace('px', '')),
            minHeight: Number(editCss.height.replace('px', '')),
            backgroundColor: buttonCss.backgroundColor,
        })
    }
    useEffect(setStyleWithSelector, [])

    useLocationChange(setStyleWithSelector)

    const { classes } = useStyles(style)

    return <NFTAvatarButton classes={classes} onClick={onClick} showSetting={false} />
}
