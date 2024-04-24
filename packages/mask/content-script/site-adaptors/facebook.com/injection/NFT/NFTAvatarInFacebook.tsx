import { useLayoutEffect, useMemo, useSyncExternalStore } from 'react'
import { useWindowSize } from 'react-use'
import { max } from 'lodash-es'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { AvatarStore } from '@masknet/web3-providers'
import { NFTBadge } from '@masknet/plugin-avatar'
import { searchFacebookAvatarSelector } from '../../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { getAvatarId } from '../../utils/user.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { useSaveAvatarInFacebook } from './useSaveAvatarInFacebook.js'

export function injectNFTAvatarInFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchFacebookAvatarSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { untilVisible: true, signal }).render(
        <NFTAvatarInFacebook />,
    )
    return
}

const useStyles = makeStyles()(() => ({
    root: {
        position: 'absolute',
        textAlign: 'center',
        color: 'white',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    },
    text: {
        fontSize: '20px !important',
        fontWeight: 700,
    },
    icon: {
        width: '19px !important',
        height: '19px !important',
    },
}))

function NFTAvatarInFacebook() {
    const { classes } = useStyles()

    const identity = useCurrentVisitingIdentity()
    const savedAvatar = useSaveAvatarInFacebook(identity)

    const store = useSyncExternalStore(AvatarStore.subscribe, AvatarStore.getSnapshot)
    const avatar = savedAvatar ?? store.retrieveAvatar(identity.identifier?.userId)
    const token = store.retrieveToken(identity.identifier?.userId)

    const windowSize = useWindowSize()
    const showAvatar = getAvatarId(identity.avatar ?? '') === avatar?.avatarId

    const size = useMemo(() => {
        const ele = searchFacebookAvatarSelector().evaluate()
        if (!ele) return 0
        const style = window.getComputedStyle(ele)
        return max([148, Number.parseInt(style.width.replace('px', '') ?? 0, 10)])
    }, [windowSize, avatar])

    // #region clear white border
    useLayoutEffect(() => {
        const node = searchFacebookAvatarSelector().closest<HTMLDivElement>(3).evaluate()
        if (!node) return

        if (showAvatar) {
            node.setAttribute('style', 'padding: 0')
        } else {
            node.removeAttribute('style')
        }
    })
    // #endregion

    if (!avatar || !token || !size || !showAvatar) return null

    return (
        <NFTBadge token={token} size={size} classes={{ root: classes.root, text: classes.text, icon: classes.icon }} />
    )
}
