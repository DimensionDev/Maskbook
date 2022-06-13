import { createReactRootShadowed, startWatch } from '../../../../utils'
import { searchTwitterAvatarLinkSelector, searchTwitterAvatarSelector } from '../../utils/selector'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useEffect, useMemo, useRef } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { ChainId } from '@masknet/web3-shared-evm'
import { getAvatarId } from '../../utils/user'
import { NFTBadge } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadge'
import { useLocation, useUpdateEffect, useWindowSize } from 'react-use'
import { rainbowBorderKeyFrames } from '../../../../plugins/Avatar/SNSAdaptor/RainbowBox'
import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants'
import { openWindow } from '@masknet/shared-base-ui'
import { usePersonaNFTAvatar } from '../../../../plugins/Avatar/hooks/usePersonaNFTAvatar'
import { useAccount } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWallet } from '../../../../plugins/Avatar/hooks/useWallet'
import { useNFT } from '../../../../plugins/Avatar/hooks'

export function injectNFTAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInTwitter />)
}

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

function NFTAvatarInTwitter() {
    const rainBowElement = useRef<Element | null>()
    const borderElement = useRef<Element | null>()
    const identity = useCurrentVisitingIdentity()
    const { value: _avatar } = usePersonaNFTAvatar(
        identity.identifier?.userId ?? '',
        getAvatarId(identity.avatar ?? ''),
        RSS3_KEY_SNS.TWITTER,
    )
    const account = useAccount()
    const { loading: loadingWallet, value: storage } = useWallet(_avatar?.userId ?? '')
    const { value: nftInfo, loading: loadingNFTInfo } = useNFT(
        storage?.address ?? account,
        _avatar?.address ?? '',
        _avatar?.tokenId ?? '',
        _avatar?.pluginId ?? NetworkPluginID.PLUGIN_EVM,
        _avatar?.chainId ?? ChainId.Mainnet,
    )

    const windowSize = useWindowSize()
    const location = useLocation()

    const showAvatar = useMemo(
        () => getAvatarId(identity.avatar ?? '') === _avatar?.avatarId && _avatar.avatarId,
        [_avatar?.avatarId, identity.avatar],
    )

    const size = useMemo(() => {
        const ele = searchTwitterAvatarSelector().evaluate()?.querySelector('img')
        if (ele) {
            const style = window.getComputedStyle(ele)
            return Number.parseInt(style.width.replace('px', '') ?? 0, 10)
        }
        return 0
    }, [windowSize, location])

    const { classes } = useStyles()

    useEffect(() => {
        if (!showAvatar) return
        const linkDom = searchTwitterAvatarLinkSelector().evaluate()

        if (linkDom?.firstElementChild && linkDom.childNodes.length === 4) {
            const linkParentDom = linkDom.closest('div')

            if (linkParentDom) linkParentDom.style.overflow = 'visible'

            // create rainbow shadow border
            if (linkDom.lastElementChild?.tagName !== 'STYLE') {
                borderElement.current = linkDom.firstElementChild
                // remove useless border
                linkDom.removeChild(linkDom.firstElementChild)
                const style = document.createElement('style')
                style.innerText = `
                ${rainbowBorderKeyFrames.styles}

                .rainbowBorder {
                    animation: ${rainbowBorderKeyFrames.name} 6s linear infinite;
                    box-shadow: 0 5px 15px rgba(0, 248, 255, 0.4), 0 10px 30px rgba(37, 41, 46, 0.2);
                    transition: none;
                    border: 0 solid #00f8ff;
                }
            `
                rainBowElement.current = linkDom.firstElementChild.nextElementSibling
                linkDom.firstElementChild.nextElementSibling?.classList.add('rainbowBorder')
                linkDom.appendChild(style)
            }
        }

        return () => {
            if (linkDom?.lastElementChild?.tagName === 'STYLE') {
                linkDom.removeChild(linkDom.lastElementChild)
            }

            if (borderElement.current && linkDom?.firstElementChild !== borderElement.current) {
                linkDom?.insertBefore(borderElement.current, linkDom.firstChild)
            }
            if (rainBowElement.current) {
                rainBowElement.current?.classList.remove('rainbowBorder')
            }
        }
    }, [location.pathname, showAvatar])

    useUpdateEffect(() => {
        const linkParentDom = searchTwitterAvatarLinkSelector().evaluate()?.closest('div')
        if (!_avatar || !linkParentDom || !showAvatar) return

        const handler = () => {
            if (loadingWallet || loadingNFTInfo) return
            openWindow(nftInfo?.permalink)
        }

        linkParentDom.addEventListener('click', handler)

        return () => {
            linkParentDom.removeEventListener('click', handler)
        }
    }, [_avatar, showAvatar, nftInfo])

    if (!_avatar || !size || loadingWallet || loadingNFTInfo) return null

    return (
        <>
            {showAvatar ? (
                <NFTBadge
                    nftInfo={nftInfo}
                    loading={loadingWallet || loadingNFTInfo}
                    borderSize={5}
                    hasRainbow
                    avatar={_avatar}
                    size={size}
                    width={15}
                    classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
                />
            ) : null}
        </>
    )
}
