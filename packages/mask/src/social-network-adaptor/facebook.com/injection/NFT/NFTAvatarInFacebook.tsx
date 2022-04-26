import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { searchFacebookAvatarOnMobileSelector, searchFacebookAvatarSelector } from '../../utils/selector'
import { createReactRootShadowed, MaskMessages, startWatch } from '../../../../utils'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import type { NFTAvatarEvent } from '@masknet/shared-base'
import { max, pickBy } from 'lodash-unified'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { useAsync, useLocation, useWindowSize } from 'react-use'
import { useWallet } from '@masknet/plugin-infra/web3'
// import type { AvatarMetaDB } from '../../../../plugins/Avatar/types'
// import { PluginNFTAvatarRPC } from '../../../../plugins/Avatar/messages'
import { getAvatarId } from '../../utils/user'
// import { useNFTAvatar } from '../../../../plugins/Avatar/hooks'
// import { NFTBadge } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadge'
import { makeStyles } from '@masknet/theme'
import { isMobileFacebook } from '../../utils/isMobile'
import { InMemoryStorages } from '../../../../../shared'
// import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants'

export function injectNFTAvatarInFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchFacebookAvatarSelector())
    if (!isMobileFacebook) {
        startWatch(watcher, signal)
        createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInFacebook />)
        return
    }

    // mobile
    const mobileWatcher = new MutationObserverWatcher(searchFacebookAvatarOnMobileSelector())
    startWatch(mobileWatcher, signal)
    createReactRootShadowed(mobileWatcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInFacebook />)
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
    return null
    // const { classes } = useStyles()
    // const wallet = useWallet()
    // const [avatar, setAvatar] = useState<AvatarMetaDB>()
    // const identity = useCurrentVisitingIdentity()
    // const location = useLocation()
    // const { value: _avatar } = useNFTAvatar(identity.identifier.userId, RSS3_KEY_SNS.FACEBOOK)

    // const [NFTEvent, setNFTEvent] = useState<NFTAvatarEvent>()

    // const windowSize = useWindowSize()
    // const showAvatar = useMemo(() => {
    //     if (isMobileFacebook) {
    //         const node = searchFacebookAvatarOnMobileSelector().closest<HTMLDivElement>(1).evaluate()

    //         if (node) {
    //             node.style.position = 'relative'
    //         }
    //     }
    //     return getAvatarId(identity.avatar ?? '') === avatar?.avatarId
    // }, [avatar?.avatarId, identity.avatar, isMobileFacebook])

    // const size = useMemo(() => {
    //     const ele = isMobileFacebook
    //         ? searchFacebookAvatarOnMobileSelector().evaluate()
    //         : searchFacebookAvatarSelector().evaluate()
    //     if (ele) {
    //         const style = window.getComputedStyle(ele)
    //         return max([148, Number.parseInt(style.width.replace('px', '') ?? 0, 10)])
    //     }
    //     return 0
    // }, [windowSize, isMobileFacebook, avatar])

    // useEffect(() => {
    //     return MaskMessages.events.NFTAvatarUpdated.on((data) =>
    //         setNFTEvent((prev) => {
    //             if (!prev) return data
    //             return { ...prev, ...pickBy<NFTAvatarEvent>(data, (item) => !!item) }
    //         }),
    //     )
    // }, [])

    // // Because of the mobile upload step, need to use memory storage to store NFTEven
    // useAsync(async () => {
    //     const storages = InMemoryStorages.FacebookNFTEventOnMobile.storage

    //     if (!wallet) return
    //     if (NFTEvent?.address && NFTEvent?.tokenId && NFTEvent?.avatarId) {
    //         try {
    //             const avatarInfo = await PluginNFTAvatarRPC.saveNFTAvatar(
    //                 wallet.address,
    //                 { ...NFTEvent, avatarId: getAvatarId(identity.avatar ?? '') } as AvatarMetaDB,
    //                 identity.identifier.network,
    //                 RSS3_KEY_SNS.FACEBOOK,
    //             )
    //             if (!avatarInfo) {
    //                 setNFTEvent(undefined)
    //                 setAvatar(undefined)
    //                 window.alert('Sorry, failed to save NFT Avatar. Please set again.')
    //                 return
    //             }

    //             setAvatar(avatarInfo)

    //             setNFTEvent(undefined)
    //         } catch (error) {
    //             setNFTEvent(undefined)
    //             setAvatar(undefined)
    //             window.alert((error as any).message)
    //             return
    //         }
    //     } else if (storages.address.value && storages.userId.value && storages.tokenId.value) {
    //         try {
    //             const avatarInfo = await PluginNFTAvatarRPC.saveNFTAvatar(
    //                 wallet.address,
    //                 {
    //                     userId: storages.userId.value,
    //                     tokenId: storages.tokenId.value,
    //                     address: storages.address.value,
    //                     avatarId: getAvatarId(identity.avatar ?? ''),
    //                 } as AvatarMetaDB,
    //                 identity.identifier.network,
    //                 RSS3_KEY_SNS.FACEBOOK,
    //             )
    //             if (!avatarInfo) {
    //                 clearStorages()
    //                 setAvatar(undefined)
    //                 window.alert('Sorry, failed to save NFT Avatar. Please set again.')
    //                 return
    //             }
    //             setAvatar(avatarInfo)
    //             clearStorages()
    //         } catch (error) {
    //             clearStorages()
    //             setAvatar(undefined)
    //             window.alert((error as any).message)
    //             return
    //         }
    //     }
    // }, [identity.avatar])

    // useEffect(() => setAvatar(_avatar), [_avatar, location])

    // // #region clear white border
    // useLayoutEffect(() => {
    //     const node = searchFacebookAvatarSelector().closest<HTMLDivElement>(3).evaluate()
    //     if (!node) return
    //     if (showAvatar) {
    //         node.setAttribute('style', 'padding: 0px')
    //     } else {
    //         node.removeAttribute('style')
    //     }
    // })
    // // #endregion

    // if (!avatar || !size || !showAvatar) return null

    // return (
    //     <NFTBadge
    //         avatar={avatar}
    //         size={size}
    //         classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
    //     />
    // )
}
