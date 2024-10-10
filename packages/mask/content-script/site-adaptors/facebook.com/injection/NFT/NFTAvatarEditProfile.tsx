import { useLayoutEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { useLocationChange } from '@masknet/shared-base-ui'
import { NFTAvatarButton } from '@masknet/plugin-avatar'
import { startWatch } from '../../../../utils/startWatch.js'
import { searchFacebookEditProfileSelector, searchFacebookProfileSettingButtonSelector } from '../../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'

export function injectOpenNFTAvatarEditProfileButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchFacebookProfileSettingButtonSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.beforeShadow, { untilVisible: true, signal }).render(
        <OpenNFTAvatarEditProfileButtonInFacebook />,
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

function OpenNFTAvatarEditProfileButtonInFacebook() {
    const [style, setStyle] = useState<StyleProps>({ minHeight: 36, fontSize: 15, marginTop: 6 })

    const setStyleWithSelector = () => {
        const editDom = searchFacebookProfileSettingButtonSelector().evaluate()
        if (!editDom) return

        const buttonDom = editDom.querySelector<HTMLDivElement>('div > div[role="button"]')
        if (!buttonDom) return

        const editCss = window.getComputedStyle(editDom)
        const buttonCss = window.getComputedStyle(buttonDom)

        // eslint-disable-next-line react/hooks-extra/no-direct-set-state-in-use-effect
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
            showSettings={false}
        />
    )
}
