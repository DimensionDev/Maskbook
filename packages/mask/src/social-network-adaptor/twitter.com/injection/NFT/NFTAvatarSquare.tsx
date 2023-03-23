import { createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import { searchTwitterAvatarNFTSelector, searchTwitterSquareAvatarSelector } from '../../utils/selector.js'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { useMemo } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { useWindowSize } from 'react-use'
import { NFTAvatarClipOrSquareInTwitter } from './NFTAvatarClip.js'
import { getAvatarType } from '../../utils/useAvatarType.js'
import { AvatarType } from '../../constant.js'
import { useInjectedCSS } from './useInjectedCSS.js'

export function injectNFTSquareAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterSquareAvatarSelector()).useForeach((ele, _, proxy) => {
        const root = createReactRootShadowed(proxy.afterShadow, { untilVisible: true, signal })
        const avatarType = getAvatarType()
        if (avatarType === AvatarType.Square) root.render(<NFTSquareAvatarInTwitter signal={signal} />)
        return () => root.destroy()
    })
    startWatch(watcher, signal)
}

interface NFTAvatarInTwitterProps {
    signal: AbortSignal
}

function NFTSquareAvatarInTwitter(props: NFTAvatarInTwitterProps) {
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
