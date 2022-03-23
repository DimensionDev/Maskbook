import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchInstagramAvatarSelector } from '../../utils/selector'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { makeStyles } from '@masknet/theme'
import { useEffect, useMemo, useState } from 'react'
import type { AvatarMetaDB } from '../../../../plugins/Avatar/types'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { useNFTAvatar } from '../../../../plugins/Avatar/hooks'
import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants'
import { getAvatarId } from '../../utils/user'
import { useLocation, useWindowSize } from 'react-use'
import { NFTBadge } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadge'
import { max } from 'lodash-unified'
import { rainbowBorderKeyFrames } from '../../../../plugins/Avatar/SNSAdaptor/RainbowBox'

export function injectNFTAvatarInInstagram(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchInstagramAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInInstagram />)
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

function NFTAvatarInInstagram() {
    const { classes } = useStyles()
    const [avatar, setAvatar] = useState<AvatarMetaDB>()

    const identity = useCurrentVisitingIdentity()
    const location = useLocation()
    const { value: _avatar } = useNFTAvatar(identity.identifier.userId, RSS3_KEY_SNS.INSTAGRAM)
    const windowSize = useWindowSize()

    const showAvatar = useMemo(() => {
        if (location.pathname?.includes('/edit')) return false
        return getAvatarId(identity.avatar ?? '') === avatar?.avatarId
    }, [avatar?.avatarId, identity.avatar, location.pathname])

    const size = useMemo(() => {
        const ele = searchInstagramAvatarSelector().evaluate()

        if (!ele) return 0

        const style = window.getComputedStyle(ele)
        return max([146, Number.parseInt(style.width.replace('px', '') ?? 0, 10)])
    }, [windowSize])

    useEffect(() => {
        if (!showAvatar) return

        let containerDom: LiveSelector<HTMLSpanElement | HTMLDivElement, true>

        if (searchInstagramAvatarSelector().evaluate()?.parentElement?.tagName === 'SPAN') {
            containerDom = searchInstagramAvatarSelector().closest<HTMLSpanElement>(1)
        } else {
            containerDom = searchInstagramAvatarSelector().closest<HTMLDivElement>(2)
        }

        const style = document.createElement('style')
        style.innerText = `
                ${rainbowBorderKeyFrames.styles}

                .rainbowBorder {
                    animation: ${rainbowBorderKeyFrames.name} 6s linear infinite;
                    box-shadow: 0 5px 15px rgba(0, 248, 255, 0.4), 0 10px 30px rgba(37, 41, 46, 0.2);
                    transition: .125s ease;
                    border: 2px solid #00f8ff;
                }
            `

        const parentDom = searchInstagramAvatarSelector().closest<HTMLDivElement>(2).evaluate()

        parentDom?.appendChild(style)

        containerDom.evaluate()?.classList.add('rainbowBorder')
        return () => {
            if (parentDom?.lastElementChild?.tagName === 'STYLE') {
                parentDom.removeChild(parentDom.lastElementChild)
            }
            containerDom.evaluate()?.classList.remove('rainbowBorder')
        }
    }, [location.pathname, showAvatar])

    useEffect(() => setAvatar(_avatar), [_avatar, location])

    if (!avatar || !size || !showAvatar) return null

    return (
        <NFTBadge
            hasRainbow={false}
            avatar={avatar}
            size={size}
            classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
        />
    )
}
