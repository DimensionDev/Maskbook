import { createReactRootShadowed, MaskMessage, NFTAvatarEvent, startWatch } from '../../../../utils'
import { searchTwitterAvatarSelector } from '../../utils/selector'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles, useSnackbar } from '@masknet/theme'
import { useState, useEffect, useCallback } from 'react'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'

import { getAvatarId } from '../../utils/user'
import { NFTBadge } from '../../../../components/InjectedComponents/NFT/NFTBadge'
import { useNFTAvatar } from '../../../../components/InjectedComponents/NFT/hooks'
import type { AvatarMetaDB } from '../../../../components/InjectedComponents/NFT/types'
import { saveNFTAvatar } from '../../../../components/InjectedComponents/NFT/gun'
import type { ERC721TokenDetailed } from '@masknet/web3-shared'

export function injectNFTAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInTwitter />)
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        top: '10px !important',
        left: 0,
        width: 134,
        textAlign: 'center',
        color: 'white',
    },
    text: {
        fontSize: '20px !important',
        fontWeight: 700,
        minWidth: 72,
    },
    icon: {
        width: '43px !important',
        height: '16px !important',
    },

    recover: {
        position: 'absolute',
        right: 160,
        top: 0,
    },
}))

interface NFTAvatarInTwitterProps {}
function NFTAvatarInTwitter(props: NFTAvatarInTwitterProps) {
    const { classes } = useStyles()
    const identity = useCurrentVisitingIdentity()
    const _avatar = useNFTAvatar(identity.identifier.userId)
    const { enqueueSnackbar } = useSnackbar()
    const [avatar, setAvatar] = useState<AvatarMetaDB | undefined>()
    const [avatarId, setAvatarId] = useState('')
    const getProfileImageSelector = () =>
        searchTwitterAvatarSelector().querySelector<HTMLElement>('div > :nth-child(2) > div img')

    const [NFTEvent, setNFTEvent] = useState<NFTAvatarEvent | undefined>()
    const onUpdate = useCallback((data: NFTAvatarEvent) => {
        const timer = setInterval(() => {
            const imgNode = getProfileImageSelector().evaluate()
            const avatarId = getAvatarId(imgNode?.getAttribute('src') ?? '')
            const oldAvatarId = getAvatarId(identity.avatar ?? '')
            if (oldAvatarId && avatarId && oldAvatarId !== avatarId) {
                clearInterval(timer)
                setNFTEvent({
                    ...data,
                    avatarId,
                })
            }
        }, 500)
    }, [])

    useEffect(() => {
        setAvatarId(getAvatarId(identity.avatar ?? ''))
    }, [identity, getAvatarId])

    useEffect(() => {
        if (!NFTEvent) return
        saveNFTAvatar(NFTEvent?.userId, NFTEvent?.avatarId, NFTEvent as ERC721TokenDetailed)
            .then((avatar: AvatarMetaDB) => {
                setAvatar(avatar)
            })
            .catch((error: Error) => {
                enqueueSnackbar(error.message, { variant: 'error' })
            })

        setAvatarId(NFTEvent.avatarId)
    }, [NFTEvent, saveNFTAvatar])

    useEffect(() => {
        setAvatar(_avatar)
    }, [_avatar])

    useEffect(() => {
        return MaskMessage.events.NFTAvatarUpdated.on((data) => {
            onUpdate(data)
        })
    }, [onUpdate])

    if (!avatar) return null
    return (
        <>
            {avatarId === avatar.avatarId ? (
                <NFTBadge
                    avatar={avatar}
                    size={14}
                    classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
                />
            ) : null}
        </>
    )
}
