import { searchTwitterAvatarNFTSelector } from '../../utils/selector.js'
import { useMemo } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { useWindowSize } from 'react-use'
import { NFTAvatarClipOrSquareInTwitter } from './NFTAvatarClip.js'
import { AvatarType } from '../../constant.js'
import { useInjectedCSS } from './useInjectedCSS.js'

export function NFTSquareAvatarInTwitter() {
    const identity = useCurrentVisitingIdentity()

    const windowSize = useWindowSize()

    const size = useMemo(() => {
        const ele = searchTwitterAvatarNFTSelector().evaluate()?.closest('a')?.querySelector('img')
        if (!ele) return 0
        const style = window.getComputedStyle(ele)
        return Number.parseInt(style.width.replace('px', '') ?? 0, 10)
    }, [windowSize, location])

    useInjectedCSS(true, true)

    if (!size || !identity.identifier?.userId) return null

    return (
        <NFTAvatarClipOrSquareInTwitter
            screenName={identity.identifier?.userId}
            size={size}
            avatarType={AvatarType.Square}
        />
    )
}
