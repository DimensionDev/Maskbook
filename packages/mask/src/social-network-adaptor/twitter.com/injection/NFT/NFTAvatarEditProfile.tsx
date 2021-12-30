import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useState, useEffect } from 'react'
import { NFTAvatarButton } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarButton'
import { startWatch, createReactRootShadowed } from '../../../../utils'
import { useLocationChange } from '../../../../utils/hooks/useLocationChange'
import { searchEditProfileSelector } from '../../utils/selector'

export function injectOpenNFTAvatarEditProfileButton(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchEditProfileSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { signal }).render(
        <OpenNFTAvatarEditProfileButtonInTwitter />,
    )
}

interface StyleProps {
    minHeight: number
    fontSize: number
    marginBottom: number
}
const useStyles = makeStyles<StyleProps>()((theme, props) => ({
    root: {
        minHeight: props.minHeight,
        fontSize: props.fontSize,
        marginBottom: props.marginBottom,
        marginTop: 1,
        marginRight: theme.spacing(0.5),
    },
}))

function OpenNFTAvatarEditProfileButtonInTwitter() {
    const [style, setStyle] = useState<StyleProps>({ minHeight: 32, fontSize: 14, marginBottom: 11 })
    const onClick = () => {
        const editDom = searchEditProfileSelector().evaluate()
        editDom?.click()
    }

    const setStyleFromEditProfileSelector = () => {
        const editDom = searchEditProfileSelector().evaluate()
        if (!editDom) return
        const css = window.getComputedStyle(editDom)
        setStyle({
            minHeight: Number(css.minHeight.replace('px', '')),
            fontSize: Number(css.fontSize.replace('px', '')),
            marginBottom: Number(css.marginBottom.replace('px', '')),
        })
    }

    useEffect(() => setStyleFromEditProfileSelector(), [])

    useLocationChange(() => setStyleFromEditProfileSelector())

    const { classes } = useStyles(style)
    return <NFTAvatarButton classes={{ root: classes.root }} onClick={onClick} />
}
