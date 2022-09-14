import { createReactRootShadowed, MaskMessages, startWatch, useI18N } from '../../../../utils/index.js'
import {
    searchAvatarMetaSelector,
    searchAvatarSelector,
    searchTwitterAvatarLinkSelector,
    searchTwitterAvatarSelector,
} from '../../utils/selector.js'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { getAvatarId } from '../../utils/user.js'
import { NFTBadge } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadge.js'
import { useAsync, useLocation, useUpdateEffect, useWindowSize } from 'react-use'
import { rainbowBorderKeyFrames } from '../../../../plugins/Avatar/SNSAdaptor/RainbowBox.js'
import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants.js'
import { usePersonaNFTAvatar } from '../../../../plugins/Avatar/hooks/usePersonaNFTAvatar.js'
import { useAccount } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { Box, Typography } from '@mui/material'
import { openWindow } from '@masknet/shared-base-ui'
import { useWallet } from '../../../../plugins/Avatar/hooks/useWallet.js'
import { useNFT, useSaveNFTAvatar } from '../../../../plugins/Avatar/hooks/index.js'
import { NFTCardStyledAssetPlayer, useShowConfirm } from '@masknet/shared'
import type { AvatarMetaDB } from '../../../../plugins/Avatar/types.js'
import { EnhanceableSite, NFTAvatarEvent, CrossIsolationMessages } from '@masknet/shared-base'
import { activatedSocialNetworkUI } from '../../../../social-network/ui.js'
import { NFTAvatar } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatar.js'

export function injectNFTAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <NFTAvatarInTwitter signal={signal} />,
    )
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

interface NFTAvatarInTwitterProps {
    signal: AbortSignal
}

function NFTAvatarInTwitter(props: NFTAvatarInTwitterProps) {
    const { t } = useI18N()
    const rainBowElement = useRef<Element | null>()
    const borderElement = useRef<Element | null>()
    const identity = useCurrentVisitingIdentity()
    const { value: nftAvatar } = usePersonaNFTAvatar(
        identity.identifier?.userId ?? '',
        getAvatarId(identity.avatar),
        '',
        RSS3_KEY_SNS.TWITTER,
    )
    const account = useAccount()
    const { loading: loadingWallet, value: storage } = useWallet(nftAvatar?.userId)
    const { value: nftInfo, loading: loadingNFTInfo } = useNFT(
        storage?.address ?? account,
        nftAvatar?.address,
        nftAvatar?.tokenId,
        nftAvatar?.pluginId,
        nftAvatar?.chainId,
    )

    const windowSize = useWindowSize()
    const _location = useLocation()

    const [updatedAvatar, setUpdatedAvatar] = useState(false)

    const showAvatar = useMemo(
        () => !!nftAvatar?.avatarId && getAvatarId(identity.avatar) === nftAvatar.avatarId,
        [nftAvatar?.avatarId, identity.avatar],
    )

    const size = useMemo(() => {
        const ele = searchTwitterAvatarSelector().evaluate()?.querySelector('img')
        if (ele) {
            const style = window.getComputedStyle(ele)
            return Number.parseInt(style.width.replace('px', '') ?? 0, 10)
        }
        return 0
    }, [windowSize, _location])

    const { classes } = useStyles()

    const [NFTEvent, setNFTEvent] = useState<NFTAvatarEvent>()
    const openConfirmDialog = useShowConfirm()
    const saveNFTAvatar = useSaveNFTAvatar()

    // After the avatar is set, it cannot be saved immediately,
    // and must wait until the avatar of twitter gets updated
    useAsync(async () => {
        if (!account || !NFTAvatar) return
        if (!identity.identifier) return

        if (!NFTEvent?.address || !NFTEvent?.tokenId) {
            MaskMessages.events.NFTAvatarTimelineUpdated.sendToAll({
                userId: identity.identifier.userId,
                avatarId: getAvatarId(identity.avatar ?? ''),
                address: '',
                tokenId: '',
                schema: SchemaType.ERC721,
                pluginId: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainId.Mainnet,
            })
            return
        }

        const avatar = await saveNFTAvatar(
            account,
            {
                ...NFTEvent,
                avatarId: getAvatarId(identity.avatar ?? ''),
            } as AvatarMetaDB,
            identity.identifier.network as EnhanceableSite,
            RSS3_KEY_SNS.TWITTER,
        ).catch((error) => {
            setNFTEvent(undefined)
            window.alert(error.message)
            return
        })
        if (!avatar) {
            setNFTEvent(undefined)
            window.alert('Sorry, failed to save NFT Avatar. Please set again.')
            return
        }
        openConfirmDialog({
            title: t('plugin_avatar_setup_share_title'),
            content: (
                <Box display="flex" flexDirection="column" alignItems="center">
                    <NFTCardStyledAssetPlayer contractAddress={avatar.address} tokenId={avatar.tokenId} />
                    <Typography mt={3} fontSize="18px">
                        {t('plugin_avatar_setup_success')}
                    </Typography>
                </Box>
            ),
            confirmLabel: t('share'),
            onSubmit() {
                activatedSocialNetworkUI.utils.share?.(t('plugin_avatar_setup_pfp_share'))
            },
        })

        MaskMessages.events.NFTAvatarTimelineUpdated.sendToAll(
            (avatar ?? {
                userId: identity.identifier.userId,
                avatarId: getAvatarId(identity.avatar ?? ''),
                address: '',
                tokenId: '',
                schema: SchemaType.ERC721,
                pluginId: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainId.Mainnet,
            }) as NFTAvatarEvent,
        )

        setNFTEvent(undefined)
    }, [identity.avatar, openConfirmDialog, t, saveNFTAvatar])

    useEffect(() => {
        return MaskMessages.events.NFTAvatarUpdated.on((data) => setNFTEvent(data))
    }, [])

    useEffect(() => {
        if (!showAvatar || !updatedAvatar) return
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
                rainBowElement.current.classList.remove('rainbowBorder')
            }
        }
    }, [location.pathname, showAvatar, updatedAvatar])

    useUpdateEffect(() => {
        const linkParentDom = searchTwitterAvatarLinkSelector().evaluate()?.closest('div')
        if (!nftAvatar || !linkParentDom || !showAvatar) return

        const handler = (event: MouseEvent) => {
            if (!nftAvatar.tokenId || !nftAvatar.address) return

            event.stopPropagation()
            event.preventDefault()

            // TODO: refactor NFTCard and Collectible to support multiple networks
            if (nftAvatar.chainId !== ChainId.Mainnet || nftAvatar.pluginId !== NetworkPluginID.PLUGIN_EVM) {
                if (nftInfo?.permalink) openWindow(nftInfo.permalink)
                return
            }
            CrossIsolationMessages.events.requestNFTCardDialog.sendToLocal({
                open: true,
                pluginID: nftAvatar.pluginId,
                chainId: nftAvatar.chainId,
                address: nftAvatar.address,
                tokenId: nftAvatar.tokenId,
            })
        }

        linkParentDom.addEventListener('click', handler, true)

        return () => {
            linkParentDom.removeEventListener('click', handler)
        }
    }, [nftAvatar, showAvatar, nftInfo])

    const handler = () => {
        const avatar = searchAvatarSelector().evaluate()?.getAttribute('src')
        if (!avatar || !nftAvatar?.avatarId) return
        setUpdatedAvatar(!!nftAvatar?.avatarId && getAvatarId(avatar ?? '') === nftAvatar.avatarId)
    }

    new MutationObserverWatcher(searchAvatarMetaSelector())
        .addListener('onAdd', handler)
        .addListener('onChange', handler)
        .startWatch(
            {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['src'],
            },
            props.signal,
        )

    if (!nftAvatar || !size || loadingWallet || loadingNFTInfo || !showAvatar || !updatedAvatar) return null

    return (
        <NFTBadge
            nftInfo={nftInfo}
            borderSize={5}
            hasRainbow
            avatar={nftAvatar}
            size={size}
            width={15}
            classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
        />
    )
}
