import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import { useWindowSize } from 'react-use'
import { useNFTAvatar } from '../../../../plugins/Avatar/hooks'
import { NFTAvatarClip } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarClip'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { searchTwitterAvatarNFTSelector } from '../../utils/selector'

export function injectNFTAvatarClipInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatarNFTSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarClipInTwitter />)
}

const useStyles = makeStyles()(() => ({
    root: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    text: {},
    icon: {},
}))

function NFTAvatarClipInTwitter() {
    const { value: avatar } = useNFTAvatar('lelenei1')
    const { classes } = useStyles()
    const windowSize = useWindowSize()
    const size = useMemo(() => {
        const ele = searchTwitterAvatarNFTSelector().evaluate()
        if (!ele) return 134.5
        const style = window.getComputedStyle(ele)
        return Number.parseInt(style.width.replace('px', '') ?? 0, 10)
    }, [windowSize])

    if (!avatar) return null
    return (
        <NFTAvatarClip
            id="TwitterAvatarClip"
            avatar={avatar}
            width={size}
            height={size}
            viewBox="0 0 200 188"
            classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
        />
    )
}
