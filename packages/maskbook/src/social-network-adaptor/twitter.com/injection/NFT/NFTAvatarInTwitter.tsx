import { createReactRootShadowed, MaskMessage, NFTAvatarEvent, startWatch } from '../../../../utils'
import { searchTwitterAvatarSelector } from '../../utils/selector'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useState, useEffect, useCallback } from 'react'

import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { useWallet, useWeb3 } from '@masknet/web3-shared'
import type { AvatarMetaDB } from '../../../../plugins/Avatar/types'
import { useNFTAvatar } from '../../../../plugins/Avatar/hooks'
import { getAvatarId } from '../../utils/user'
import { PluginNFTAvatarRPC } from '../../../../plugins/Avatar/messages'
import { NFTBadge } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadge'

const RETRIES_NUMBER = 10

export function injectNFTAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInTwitter />)
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        bottom: '-10px !important',
        left: 0,
        textAlign: 'center',
        color: 'white',
        transform: 'scale(1) !important',
        minWidth: 134,
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

interface NFTAvatarInTwitterProps {}
function NFTAvatarInTwitter(props: NFTAvatarInTwitterProps) {
    const { classes } = useStyles()
    const identity = useCurrentVisitingIdentity()
    const wallet = useWallet()
    const web3 = useWeb3()

    const _avatar = useNFTAvatar(identity.identifier.userId)
    const [avatar, setAvatar] = useState<AvatarMetaDB | undefined>()
    const [avatarId, setAvatarId] = useState('')
    const [retries, setRetries] = useState(RETRIES_NUMBER)
    const getProfileImageSelector = () =>
        searchTwitterAvatarSelector().querySelector<HTMLElement>('div > :nth-child(2) > div img')

    const [NFTEvent, setNFTEvent] = useState<NFTAvatarEvent | undefined>()
    const onUpdate = useCallback(
        (data: NFTAvatarEvent) => {
            const oldAvatarId = getAvatarId(identity.avatar ?? '')
            const timer = setInterval(() => {
                const imgNode = getProfileImageSelector().evaluate()
                const avatarId = getAvatarId(imgNode?.getAttribute('src') ?? '')
                if ((oldAvatarId && avatarId && oldAvatarId !== avatarId) || retries <= 0) {
                    console.log(oldAvatarId)
                    console.log(avatarId)
                    clearInterval(timer)
                    setNFTEvent({
                        ...data,
                        avatarId: retries <= 0 ? '' : avatarId,
                    })
                }
                setRetries((retries) => retries - 1)
            }, 500)
        },
        [retries],
    )

    useEffect(() => {
        setAvatarId(getAvatarId(identity.avatar ?? ''))
    }, [identity, getAvatarId])

    useEffect(() => {
        if (!NFTEvent) return
        if (!wallet) return

        PluginNFTAvatarRPC.saveNFTAvatar(wallet.address, NFTEvent as AvatarMetaDB).then(
            (avatar: AvatarMetaDB | undefined) => {
                if (!avatar) throw new Error('Not Found')
                setAvatar(avatar)
            },
        )

        setAvatarId(NFTEvent.avatarId)
    }, [NFTEvent, PluginNFTAvatarRPC])

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
            {avatarId === avatar.avatarId && avatar.avatarId ? (
                <NFTBadge
                    avatar={avatar}
                    size={14}
                    classes={{ root: classes.root, text: classes.text, icon: classes.icon }}
                />
            ) : null}
        </>
    )
}
