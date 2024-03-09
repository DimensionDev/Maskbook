import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { NFTBadge } from '@masknet/plugin-avatar'
import { useLocation, useWindowSize } from 'react-use'
import { AvatarStore, Twitter } from '@masknet/web3-providers'
import { useInjectedCSS } from './useInjectedCSS.js'
import { useUpdatedAvatar } from './useUpdatedAvatar.js'
import { useSaveAvatarInTwitter } from './useSaveAvatarInTwitter.js'
import { searchAvatarMetaSelector, searchAvatarSelector, searchTwitterAvatarSelector } from '../../utils/selector.js'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'

const useStyles = makeStyles()(() => ({
    root: {
        transform: 'scale(1.022)',
        position: 'absolute',
        textAlign: 'center',
        color: 'white',
        zIndex: 2,
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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

export function NFTAvatarInTwitter() {
    const windowSize = useWindowSize()
    const _location = useLocation()
    const { classes } = useStyles()
    const [updatedAvatar, setUpdatedAvatar] = useState(false)

    const size = useMemo(() => {
        const ele = searchTwitterAvatarSelector().evaluate()?.querySelector('img')
        if (!ele) return 0
        const style = window.getComputedStyle(ele)
        return Number.parseInt(style.width.replace('px', '') ?? 0, 10)
    }, [windowSize, _location])

    const { showAvatar, token, avatar } = useNFTCircleAvatar(size)

    useInjectedCSS(showAvatar, updatedAvatar)
    useUpdatedAvatar(showAvatar, avatar)

    const handlerWatcher = () => {
        const avatarUrl = searchAvatarSelector().evaluate()?.getAttribute('src')
        if (!avatarUrl || !avatar?.avatarId) return
        setUpdatedAvatar(!!avatar?.avatarId && Twitter.getAvatarId(avatarUrl ?? '') === avatar.avatarId)
    }
    useEffect(() => {
        const abortController = new AbortController()
        new MutationObserverWatcher(searchAvatarMetaSelector())
            .addListener('onAdd', handlerWatcher)
            .addListener('onChange', handlerWatcher)
            .startWatch(
                {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['src'],
                },
                abortController.signal,
            )
        return () => abortController.abort()
    }, [handlerWatcher])
    if (!showAvatar) return null

    return (
        <NFTBadge
            token={token}
            borderSize={5}
            hasRainbow
            size={size}
            width={12}
            classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
        />
    )
}

function useNFTCircleAvatar(size: number) {
    const identity = useCurrentVisitingIdentity()
    const savedAvatar = useSaveAvatarInTwitter(identity)

    const store = useSyncExternalStore(AvatarStore.subscribe, AvatarStore.getSnapshot)
    const avatar =
        savedAvatar ?? store.retrieveAvatar(identity.identifier?.userId, Twitter.getAvatarId(identity.avatar))
    const token = store.retrieveToken(identity.identifier?.userId, Twitter.getAvatarId(identity.avatar))

    const showAvatar = useMemo(() => {
        const avatarUrl = searchAvatarSelector().evaluate()?.getAttribute('src')
        if (!avatarUrl || !avatar?.avatarId) return false
        return Twitter.getAvatarId(avatarUrl ?? '') === avatar.avatarId
    }, [avatar?.avatarId, identity.avatar])

    return {
        showAvatar: Boolean(size && avatar && showAvatar && token),
        avatar,
        token,
    }
}
