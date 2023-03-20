import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { isZero } from '@masknet/web3-shared-base'
import { useEffect, useMemo, useRef } from 'react'
import { useLocation, useWindowSize } from 'react-use'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import {
    NFTAvatarClip,
    NFTAvatarSquare,
    formatPrice,
    formatText,
    useNFT,
    useNFTContainerAtTwitter,
} from '@masknet/plugin-avatar'
import { createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import {
    searchTwitterAvatarNFTLinkSelector,
    searchTwitterAvatarNFTSelector,
    searchTwitterAvatarNFTStyleSelector,
} from '../../utils/selector.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { NFTAvatarInTwitter } from './NFTAvatarInTwitter.js'

enum AvatarType {
    AVATAR_SQUARE = 'shape-square',
    AVATAR_CLIP = 'shape-hex',
    AVATAR_CIRCLE = 'circle',
}

export function injectNFTAvatarClipInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatarNFTSelector()).useForeach((ele, _, proxy) => {
        const root = createReactRootShadowed(proxy.afterShadow, { untilVisible: true, signal })
        root.render(<NFTAvatarClipInTwitter signal={signal} />)
        return () => root.destroy()
    })
    startWatch(watcher, signal)
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

interface NFTAvatarClipInTwitterProps {
    signal: AbortSignal
}
function NFTAvatarClipInTwitter(props: NFTAvatarClipInTwitterProps) {
    const { classes } = useStyles()
    const windowSize = useWindowSize()
    const location = useLocation()
    const borderElement = useRef<Element | null>()
    const linkDom = useRef<Element | null>()

    const size = useMemo(() => {
        const ele = searchTwitterAvatarNFTSelector().evaluate()?.closest('a')?.querySelector('img')
        if (!ele) return 0
        const style = window.getComputedStyle(ele)
        return Number.parseInt(style.width.replace('px', '') ?? 0, 10)
    }, [windowSize, location])

    const identity = useCurrentVisitingIdentity()

    useEffect(() => {
        const timer = setTimeout(() => {
            linkDom.current = searchTwitterAvatarNFTLinkSelector().evaluate()
            if (linkDom.current?.firstElementChild && linkDom.current?.childNodes.length === 4) {
                borderElement.current = linkDom.current.firstElementChild
                // remove useless border
                linkDom.current.removeChild(linkDom.current?.firstElementChild)
            }
            const link = linkDom.current as HTMLElement
            if (link?.style) {
                link.style.backgroundColor = 'transparent'
                link.style.boxShadow = 'none'
            }
        }, 5000)

        return () => {
            clearTimeout(timer)
            if (
                borderElement.current &&
                borderElement.current !== linkDom.current?.firstElementChild &&
                linkDom.current
            )
                linkDom.current.insertBefore(borderElement.current, linkDom.current.firstChild)
        }
    }, [location.pathname])

    const avatarType = useMemo(() => {
        const dom = searchTwitterAvatarNFTStyleSelector().evaluate()
        if (!dom) return AvatarType.AVATAR_CIRCLE
        const styles = window.getComputedStyle(dom)
        return styles.clipPath.includes('#shape-square')
            ? AvatarType.AVATAR_SQUARE
            : styles.clipPath.includes('#shape-hex')
            ? AvatarType.AVATAR_CLIP
            : AvatarType.AVATAR_CIRCLE
    }, [])

    if (isZero(size) || !identity.identifier) return null
    return (
        <>
            {avatarType !== AvatarType.AVATAR_CIRCLE ? (
                <NFTAvatarClipOrSquareInTwitter
                    screenName={identity.identifier.userId}
                    size={size}
                    avatarType={avatarType}
                />
            ) : (
                <NFTAvatarInTwitter signal={props.signal} />
            )}
        </>
    )
}

interface NFTAvatarClipOrSquareProps {
    screenName: string
    size: number
    avatarType: AvatarType
}
function NFTAvatarClipOrSquareInTwitter({ screenName, size, avatarType }: NFTAvatarClipOrSquareProps) {
    const { classes } = useStyles()
    const { loading, value: avatarMetadata } = useNFTContainerAtTwitter(screenName)
    const { account } = useChainContext()
    const { value = { amount: '0', symbol: 'ETH', name: '', slug: '' }, loading: loadingNFT } = useNFT(
        account,
        avatarMetadata?.address,
        avatarMetadata?.token_id,
        NetworkPluginID.PLUGIN_EVM,
        ChainId.Mainnet,
    )

    const name = useMemo(() => {
        if (loading || loadingNFT) return 'Loading...'
        return `${formatText(value.name, avatarMetadata?.token_id ?? '')} ${
            value.slug?.toLowerCase() === 'ens' ? 'ENS' : ''
        }`
    }, [JSON.stringify(value), loading, loadingNFT, avatarMetadata?.token_id])

    const price = useMemo(() => {
        if (loading || loadingNFT) return 'Loading...'
        return formatPrice(value.amount, value.symbol)
    }, [JSON.stringify(value), loading, loadingNFT])

    if (!avatarMetadata?.address || !avatarMetadata?.token_id) return null

    return (
        <>
            {avatarType === AvatarType.AVATAR_SQUARE ? (
                <NFTAvatarSquare stroke="black" strokeWidth={14} fontSize={9} name={name} price={price} width={size} />
            ) : avatarType === AvatarType.AVATAR_CLIP ? (
                <NFTAvatarClip
                    size={size}
                    classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
                    name={name}
                    price={price}
                />
            ) : null}
        </>
    )
}
