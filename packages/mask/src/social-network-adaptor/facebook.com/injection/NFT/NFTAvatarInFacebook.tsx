import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useAsync, useLocation, useWindowSize } from 'react-use'
import { max, pickBy } from 'lodash-es'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchFacebookAvatarOnMobileSelector, searchFacebookAvatarSelector } from '../../utils/selector.js'
import { attachReactTreeWithContainer, startWatch } from '../../../../utils/index.js'
import { type NFTAvatarEvent, NetworkPluginID, MaskMessages } from '@masknet/shared-base'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI.js'
import { useSaveStringStorage, type AvatarMetaDB, type NextIDAvatarMeta } from '@masknet/plugin-avatar'
import { getAvatarId } from '../../utils/user.js'
import { useNFT, useNFTAvatar, NFTBadge, RSS3_KEY_SNS, useWallet } from '@masknet/plugin-avatar'
import { makeStyles } from '@masknet/theme'
import { isMobileFacebook } from '../../utils/isMobile.js'
import { InMemoryStorages } from '../../../../../shared/index.js'

import { useChainContext } from '@masknet/web3-hooks-base'

export function injectNFTAvatarInFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchFacebookAvatarSelector())
    if (!isMobileFacebook) {
        startWatch(watcher, signal)
        attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { untilVisible: true, signal }).render(
            <NFTAvatarInFacebook />,
        )
        return
    }

    // mobile
    const mobileWatcher = new MutationObserverWatcher(searchFacebookAvatarOnMobileSelector())
    startWatch(mobileWatcher, signal)
    attachReactTreeWithContainer(mobileWatcher.firstDOMProxy.afterShadow, { untilVisible: true, signal }).render(
        <NFTAvatarInFacebook />,
    )
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

const clearStorages = () => {
    InMemoryStorages.FacebookNFTEventOnMobile.storage.userId.setValue('')
    InMemoryStorages.FacebookNFTEventOnMobile.storage.address.setValue('')
    InMemoryStorages.FacebookNFTEventOnMobile.storage.tokenId.setValue('')
}

function NFTAvatarInFacebook() {
    const { classes } = useStyles()

    const [avatar, setAvatar] = useState<AvatarMetaDB>()
    const identity = useCurrentVisitingIdentity()
    const location = useLocation()
    const { value: nftAvatar } = useNFTAvatar(identity.identifier?.userId, RSS3_KEY_SNS.FACEBOOK)
    const { account } = useChainContext()
    const { loading: loadingWallet, value: storage } = useWallet(nftAvatar?.userId)
    const { value: nftInfo, loading: loadingNFTInfo } = useNFT(
        storage?.address ?? account,
        nftAvatar?.address,
        nftAvatar?.tokenId,
        nftAvatar?.pluginId ?? NetworkPluginID.PLUGIN_EVM,
        nftAvatar?.chainId,
    )

    const [NFTEvent, setNFTEvent] = useState<NFTAvatarEvent>()
    const saveNFTAvatar = useSaveStringStorage(NetworkPluginID.PLUGIN_EVM)

    const windowSize = useWindowSize()
    const showAvatar = useMemo(() => {
        if (isMobileFacebook) {
            const node = searchFacebookAvatarOnMobileSelector().closest<HTMLDivElement>(1).evaluate()

            if (node) {
                node.style.position = 'relative'
            }
        }
        return getAvatarId(identity.avatar ?? '') === avatar?.avatarId
    }, [avatar?.avatarId, identity.avatar, isMobileFacebook])

    const size = useMemo(() => {
        const ele = isMobileFacebook
            ? searchFacebookAvatarOnMobileSelector().evaluate()
            : searchFacebookAvatarSelector().evaluate()
        if (ele) {
            const style = window.getComputedStyle(ele)
            return max([148, Number.parseInt(style.width.replace('px', '') ?? 0, 10)])
        }
        return 0
    }, [windowSize, isMobileFacebook, avatar])

    useEffect(() => {
        return MaskMessages.events.NFTAvatarUpdated.on((data) =>
            setNFTEvent((prev) => {
                if (!prev) return data
                return { ...prev, ...pickBy<NFTAvatarEvent>(data, (item) => !!item) }
            }),
        )
    }, [])

    // Because of the mobile upload step, need to use memory storage to store NFTEven
    useAsync(async () => {
        const storages = InMemoryStorages.FacebookNFTEventOnMobile.storage

        if (!account) return
        if (!identity.identifier) return
        if (NFTEvent?.address && NFTEvent?.tokenId && NFTEvent?.avatarId) {
            try {
                const avatarInfo = await saveNFTAvatar(identity.identifier.userId, account, {
                    ...NFTEvent,
                    avatarId: getAvatarId(identity.avatar ?? ''),
                } as NextIDAvatarMeta)
                if (!avatarInfo) {
                    setNFTEvent(undefined)
                    setAvatar(undefined)
                    // eslint-disable-next-line no-alert
                    window.alert('Sorry, failed to save NFT Avatar. Please set again.')
                    return
                }

                setAvatar(avatarInfo)

                setNFTEvent(undefined)
            } catch (error) {
                setNFTEvent(undefined)
                setAvatar(undefined)
                // eslint-disable-next-line no-alert
                alert((error as any).message)
                return
            }
        } else if (storages.address.value && storages.userId.value && storages.tokenId.value) {
            try {
                const avatarInfo = await saveNFTAvatar(storages.userId.value, account, {
                    userId: storages.userId.value,
                    tokenId: storages.tokenId.value,
                    address: storages.address.value,
                    avatarId: getAvatarId(identity.avatar ?? ''),
                    chainId: storages.chainId.value,
                    pluginID: storages.pluginID.value,
                    schema: storages.schema.value,
                } as unknown as NextIDAvatarMeta)
                if (!avatarInfo) {
                    clearStorages()
                    setAvatar(undefined)
                    // eslint-disable-next-line no-alert
                    alert('Sorry, failed to save NFT Avatar. Please set again.')
                    return
                }
                setAvatar(avatarInfo)
                clearStorages()
            } catch (error) {
                clearStorages()
                setAvatar(undefined)
                // eslint-disable-next-line no-alert
                alert((error as any).message)
                return
            }
        }
    }, [identity.avatar])

    useEffect(() => setAvatar(nftAvatar), [nftAvatar, location])

    // #region clear white border
    useLayoutEffect(() => {
        const node = searchFacebookAvatarSelector().closest<HTMLDivElement>(3).evaluate()
        if (!node) return
        if (showAvatar) {
            node.setAttribute('style', 'padding: 0')
        } else {
            node.removeAttribute('style')
        }
    })
    // #endregion

    if (!avatar || !size || !showAvatar || loadingWallet || loadingNFTInfo) return null

    return (
        <NFTBadge
            nftInfo={nftInfo}
            size={size}
            classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
        />
    )
}
