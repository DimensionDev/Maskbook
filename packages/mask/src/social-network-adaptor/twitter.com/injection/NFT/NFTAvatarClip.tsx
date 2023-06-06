import { makeStyles } from '@masknet/theme'
import { isZero } from '@masknet/web3-shared-base'
import { useEffect, useMemo, useRef } from 'react'
import { useLocation, useWindowSize } from 'react-use'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import {
    AvatarType,
    NFTAvatarClip,
    NFTAvatarSquare,
    formatPrice,
    formatText,
    useNFT,
    useNFTContainerAtTwitter,
} from '@masknet/plugin-avatar'
import { useI18N } from '../../../../utils/index.js'
import { searchTwitterAvatarNFTLinkSelector, searchTwitterAvatarNFTSelector } from '../../utils/selector.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

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

export function NFTAvatarClipInTwitter() {
    const windowSize = useWindowSize()
    const location = useLocation()
    const borderElement = useRef<Element | null>()
    const linkDom = useRef<Element | null>()

    const size = useMemo(() => {
        const ele = searchTwitterAvatarNFTSelector().evaluate()?.closest('a')?.querySelector('img')
        if (!ele) return 0
        return ele.clientWidth
    }, [windowSize, location])

    const identity = useCurrentVisitingIdentity()

    useEffect(() => {
        const timer = setTimeout(() => {
            linkDom.current = searchTwitterAvatarNFTLinkSelector().evaluate()
            if (linkDom.current?.firstElementChild && linkDom.current.childNodes.length === 4) {
                borderElement.current = linkDom.current.firstElementChild
                // remove useless border
                linkDom.current.removeChild(linkDom.current.firstElementChild)
            }
            const link = linkDom.current as HTMLElement
            if (link.style) {
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

    if (isZero(size) || !identity.identifier) return null

    return (
        <NFTAvatarClipOrSquareInTwitter
            screenName={identity.identifier.userId}
            size={size}
            avatarType={AvatarType.Clip}
        />
    )
}

interface NFTAvatarClipOrSquareProps {
    screenName: string
    size: number
    avatarType: AvatarType
}
export function NFTAvatarClipOrSquareInTwitter({ screenName, size, avatarType }: NFTAvatarClipOrSquareProps) {
    const { t } = useI18N()
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
        if (loading || loadingNFT) return t('loading')
        return `${formatText(value.name, avatarMetadata?.token_id ?? '')} ${
            value.slug?.toLowerCase() === 'ens' ? 'ENS' : ''
        }`
    }, [JSON.stringify(value), loading, loadingNFT, avatarMetadata?.token_id])

    const price = useMemo(() => {
        if (loading || loadingNFT) return t('loading')
        return formatPrice(value.amount, value.symbol)
    }, [JSON.stringify(value), loading, loadingNFT])

    if (!avatarMetadata?.address || !avatarMetadata.token_id) return null

    return avatarType === AvatarType.Square ? (
        <NFTAvatarSquare stroke="black" strokeWidth={20} fontSize={9} name={name} price={price} size={size} />
    ) : avatarType === AvatarType.Clip ? (
        <NFTAvatarClip
            size={size}
            classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
            name={name}
            price={price}
        />
    ) : null
}
