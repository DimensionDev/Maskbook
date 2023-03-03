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
import {
    NFTBadge,
    rainbowBorderKeyFrames,
    RSS3_KEY_SNS,
    usePersonaNFTAvatar,
    useWallet,
    useNFT,
    useSaveNFTAvatar,
} from '@masknet/plugin-avatar'
import { useAsync, useLocation, useUpdateEffect, useWindowSize } from 'react-use'
import { useChainContext, useWeb3Hub } from '@masknet/web3-hooks-base'
import { Box, Typography } from '@mui/material'
import { AssetPreviewer, useShowConfirm } from '@masknet/shared'
import type { AvatarMetaDB } from '@masknet/plugin-avatar'
import {
    NetworkPluginID,
    type EnhanceableSite,
    type NFTAvatarEvent,
    CrossIsolationMessages,
} from '@masknet/shared-base'
import { activatedSocialNetworkUI } from '../../../../social-network/ui.js'
import { Twitter } from '@masknet/web3-providers'

export function injectNFTAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatarSelector()).useForeach((ele, _, proxy) => {
        const root = createReactRootShadowed(proxy.afterShadow, { untilVisible: true, signal })
        root.render(<NFTAvatarInTwitter signal={signal} />)
        return () => root.destroy()
    })
    startWatch(watcher, signal)
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
        Twitter.getAvatarId(identity.avatar),
        '',
        RSS3_KEY_SNS.TWITTER,
    )
    const { account } = useChainContext()
    const { loading: loadingWallet, value: storage } = useWallet(nftAvatar?.userId)
    const { value: nftInfo, loading: loadingNFTInfo } = useNFT(
        storage?.address ?? account,
        nftAvatar?.address,
        nftAvatar?.tokenId,
        nftAvatar?.pluginId,
        nftAvatar?.chainId,
        nftAvatar?.ownerAddress,
    )

    const windowSize = useWindowSize()
    const _location = useLocation()

    const [updatedAvatar, setUpdatedAvatar] = useState(false)

    const showAvatar = useMemo(
        () => !!nftAvatar?.avatarId && Twitter.getAvatarId(identity.avatar) === nftAvatar.avatarId,
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
    const hub = useWeb3Hub(NetworkPluginID.PLUGIN_EVM)

    // After the avatar is set, it cannot be saved immediately,
    // and must wait until the avatar of twitter gets updated
    useAsync(async () => {
        if (!account || !nftAvatar || !hub?.getNonFungibleAsset || !identity.identifier) return

        if (!NFTEvent?.address || !NFTEvent?.tokenId) {
            MaskMessages.events.NFTAvatarTimelineUpdated.sendToAll({
                userId: identity.identifier.userId,
                avatarId: Twitter.getAvatarId(identity.avatar ?? ''),
                address: '',
                tokenId: '',
                schema: SchemaType.ERC721,
                pluginID: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainId.Mainnet,
            })
            return
        }

        const avatar = await saveNFTAvatar(
            account,
            {
                ...NFTEvent,
                avatarId: Twitter.getAvatarId(identity.avatar ?? ''),
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

        const NFTDetailed = await hub.getNonFungibleAsset(avatar.address ?? '', avatar.tokenId, {
            chainId: ChainId.Mainnet,
        })

        openConfirmDialog({
            title: t('plugin_avatar_setup_share_title'),
            content: (
                <Box display="flex" flexDirection="column" alignItems="center">
                    <AssetPreviewer url={NFTDetailed?.metadata?.imageURL || NFTDetailed?.metadata?.mediaURL} />
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
                avatarId: Twitter.getAvatarId(identity.avatar ?? ''),
                address: '',
                tokenId: '',
                schema: SchemaType.ERC721,
                pluginId: NetworkPluginID.PLUGIN_EVM,
                chainId: ChainId.Mainnet,
            }) as NFTAvatarEvent,
        )

        setNFTEvent(undefined)
    }, [identity.avatar, openConfirmDialog, t, saveNFTAvatar, hub?.getNonFungibleAsset])

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
        if (!showAvatar) return

        const linkParentDom = searchTwitterAvatarLinkSelector().evaluate()?.closest('div')
        if (!linkParentDom) return

        const handler = (event: MouseEvent) => {
            if (!nftAvatar?.tokenId || !nftAvatar?.address) return
            event.stopPropagation()
            event.preventDefault()
            if (!nftAvatar.pluginId || !nftAvatar.chainId) return
            CrossIsolationMessages.events.nonFungibleTokenDialogEvent.sendToLocal({
                open: true,
                pluginID: nftAvatar.pluginId,
                chainId: nftAvatar.chainId,
                tokenId: nftAvatar.tokenId,
                tokenAddress: nftAvatar.address,
                ownerAddress: nftAvatar.ownerAddress,
                origin: 'pfp',
            })
        }

        const clean = () => {
            linkParentDom.removeEventListener('click', handler, true)
        }

        if (!nftAvatar) {
            clean()
            return
        }

        linkParentDom.addEventListener('click', handler, true)

        return clean
    }, [nftAvatar, showAvatar, nftInfo])

    const handlerWatcher = () => {
        const avatar = searchAvatarSelector().evaluate()?.getAttribute('src')
        if (!avatar || !nftAvatar?.avatarId) return
        setUpdatedAvatar(!!nftAvatar?.avatarId && Twitter.getAvatarId(avatar ?? '') === nftAvatar.avatarId)
    }

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
