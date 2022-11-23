import { useLayoutEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchFacebookEditProfileSelector, searchFacebookProfileSettingButtonSelector } from '../../utils/selector.js'
import { createReactRootShadowed, startWatch, useLocationChange } from '../../../../utils/index.js'
import { NFTAvatarButton } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarButton.js'

export function injectOpenNFTAvatarEditProfileButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchFacebookProfileSettingButtonSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { untilVisible: true, signal }).render(
        <OpenNFTAvatarEditProfileButtonInFaceBook />,
    )
}

interface StyleProps {
    minHeight: number
    fontSize: number
    marginTop: number
    backgroundColor?: string
    color?: string
}

const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        minHeight: props.minHeight,
        fontSize: props.fontSize,
        marginTop: props.marginTop,
        backgroundColor: theme.palette.maskColor.main,
        marginRight: theme.spacing(0.5),
        marginLeft: theme.spacing(1.25),
        borderRadius: '6px !important',
        border: 'none !important',
        color: props.color,
    },
}))

export function openNFTAvatarSettingDialog() {
    const editDom = searchFacebookEditProfileSelector().evaluate()
    editDom?.click()
}

function OpenNFTAvatarEditProfileButtonInFaceBook() {
    const [style, setStyle] = useState<StyleProps>({ minHeight: 36, fontSize: 15, marginTop: 6 })

    const setStyleWithSelector = () => {
        const editDom = searchFacebookProfileSettingButtonSelector().evaluate()
        if (!editDom) return

        const buttonDom = editDom.querySelector<HTMLDivElement>('div > div[role="button"]')
        if (!buttonDom) return

        const editCss = window.getComputedStyle(editDom)
        const buttonCss = window.getComputedStyle(buttonDom)

        setStyle({
            fontSize: Number(editCss.fontSize.replace('px', '')),
            marginTop: Number(editCss.paddingTop.replace('px', '')),
            minHeight: 36,
            backgroundColor: buttonCss.backgroundColor,
            color: buttonCss.color,
        })
    }

    useLayoutEffect(() => {
        setStyleWithSelector()
    }, [])

    useLocationChange(() => {
        setStyleWithSelector()
    })

    const { classes } = useStyles(style)

    return (
        <NFTAvatarButton
            classes={{
                root: classes.root,
            }}
            onClick={openNFTAvatarSettingDialog}
            showSetting={false}
        />
    )
}
