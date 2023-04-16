import { createReactRootShadowed, MaskMessages, startWatch, useI18N } from '../../../../utils/index.js'
import {
    searchAvatarMetaSelector,
    searchAvatarSelector,
    searchTwitterAvatarNormalSelector,
    searchTwitterAvatarSelector,
} from '../../utils/selector.js'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useEffect, useMemo, useState } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import {
    NFTBadge,
    RSS3_KEY_SNS,
    usePersonaNFTAvatar,
    useWallet,
    useNFT,
    type NextIDAvatarMeta,
    useSaveStringStorage,
    NFTAvatarSquare,
    AvatarType,
} from '@masknet/plugin-avatar'
import { useAsync, useLocation, useWindowSize } from 'react-use'
import { useChainContext, useWeb3Hub } from '@masknet/web3-hooks-base'
import { Box, Typography } from '@mui/material'
import { AssetPreviewer, useShowConfirm } from '@masknet/shared'

import { NetworkPluginID, type NFTAvatarEvent } from '@masknet/shared-base'
import { activatedSocialNetworkUI } from '../../../../social-network/ui.js'
import { Twitter } from '@masknet/web3-providers'
import { useInjectedCSS } from './useInjectedCSS.js'
import { useUpdatedAvatar } from './useUpdatedAvatar.js'
import { getAvatarType, getInjectedDom } from '../../utils/AvatarType.js'

function updateAvatarToSquare() {
    const dom = searchTwitterAvatarNormalSelector().evaluate()
    const children = dom?.firstElementChild as HTMLDivElement
    if (!children) return
    children.style.clipPath = 'url("#shape-square")'
    children.style.overflow = 'visible'
    const parent = dom?.parentElement as HTMLDivElement
    if (!parent) return
    parent.style.clipPath = 'url("#shape-square")'
    parent.style.overflow = 'visible'
    const next = children.nextSibling as HTMLDivElement
    if (!next) return
    next.style.overflow = 'visible'

    const next1 = next.nextSibling as HTMLDivElement
    if (!next1) return
    next1.style.overflow = 'visible'
}

export function injectNFTAvatarInTwitter(signal: AbortSignal) {
    updateAvatarToSquare()

    const watcher = new MutationObserverWatcher(getInjectedDom()).useForeach((ele, _, proxy) => {
        const root = createReactRootShadowed(proxy.afterShadow, { untilVisible: true, signal })

        root.render(<NFTAvatarInTwitter />)
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

export function NFTAvatarInTwitter() {
    const windowSize = useWindowSize()
    const _location = useLocation()
    const { classes } = useStyles()
    const [updatedAvatar, setUpdatedAvatar] = useState(false)

    const size = useMemo(() => {
        const ele = searchTwitterAvatarSelector().evaluate()?.querySelector('img')
        if (ele) {
            const style = window.getComputedStyle(ele)
            return Number.parseInt(style.width.replace('px', '') ?? 0, 10)
        }
        return 0
    }, [windowSize, _location])

    const { showAvatar, nftInfo, nftAvatar } = useNFTCircleAvatar(size)

    useInjectedCSS(showAvatar, updatedAvatar)
    useUpdatedAvatar(showAvatar, nftAvatar)

    const handlerWatcher = () => {
        const avatar = searchAvatarSelector().evaluate()?.getAttribute('src')
        if (!avatar || !nftAvatar?.avatarId) return
        setUpdatedAvatar(!!nftAvatar?.avatarId && Twitter.getAvatarId(avatar ?? '') === nftAvatar.avatarId)
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

    const avatarType = getAvatarType()
    switch (avatarType) {
        case AvatarType.Default:
            return (
                <NFTBadge
                    nftInfo={nftInfo}
                    borderSize={5}
                    hasRainbow
                    size={size}
                    width={12}
                    classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
                />
            )
        case AvatarType.Square:
            return (
                <NFTAvatarSquare
                    stroke="black"
                    strokeWidth={20}
                    fontSize={9}
                    name={nftInfo?.name ?? ''}
                    price={nftInfo?.amount ?? ''}
                    size={size}
                />
            )
        default:
            return null
    }
}

function useNFTCircleAvatar(size: number) {
    const { t } = useI18N()

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

    const showAvatar = useMemo(
        () => !!nftAvatar?.avatarId && Twitter.getAvatarId(identity.avatar) === nftAvatar.avatarId,
        [nftAvatar?.avatarId, identity.avatar],
    )
    const [NFTEvent, setNFTEvent] = useState<NFTAvatarEvent>()
    const openConfirmDialog = useShowConfirm()
    const saveNFTAvatar = useSaveStringStorage(NetworkPluginID.PLUGIN_EVM)
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

        const avatar = await saveNFTAvatar(identity.identifier.userId, account, {
            ...NFTEvent,
            avatarId: Twitter.getAvatarId(identity.avatar ?? ''),
        } as NextIDAvatarMeta).catch((error) => {
            setNFTEvent(undefined)
            // eslint-disable-next-line no-alert
            alert(error.message)
            return
        })
        if (!avatar) {
            setNFTEvent(undefined)
            // eslint-disable-next-line no-alert
            alert('Sorry, failed to save NFT Avatar. Please set again.')
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

    return {
        showAvatar: Boolean(size && nftAvatar && !loadingWallet && !loadingNFTInfo && showAvatar && nftInfo),
        nftAvatar,
        nftInfo,
        loading: loadingWallet || loadingNFTInfo,
    }
}
