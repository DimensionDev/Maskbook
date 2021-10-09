import { createReactRootShadowed, MaskMessage, NFTAvatarEvent, startWatch } from '../../../../utils'
import { searchTwitterAvatarSelector } from '../../utils/selector'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useState, useEffect } from 'react'

import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import { useWallet } from '@masknet/web3-shared'
import type { AvatarMetaDB } from '../../../../plugins/Avatar/types'
import { useNFTAvatar } from '../../../../plugins/Avatar/hooks'
import { getAvatarId } from '../../utils/user'
import { PluginNFTAvatarRPC } from '../../../../plugins/Avatar/messages'
import { NFTBadge } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadge'
import { IconButton } from '@material-ui/core'
import UpdateIcon from '@mui/icons-material/Update'
import { useCurrentProfileIdentifier } from '../../../../plugins/Avatar/hooks/useCurrentUserInfo'

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
        minWidth: 134,
    },
    update: {
        position: 'absolute',
        bottom: '-10px !important',
        left: 55,
        textAlign: 'center',
        color: 'white',
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

function NFTAvatarInTwitter() {
    const { classes } = useStyles()
    const identity = useCurrentVisitingIdentity()
    const currentUserInfo = useCurrentProfileIdentifier()
    const wallet = useWallet()
    const _avatar = useNFTAvatar(identity.identifier.userId)
    const [avatar, setAvatar] = useState<AvatarMetaDB | undefined>()
    const [avatarId, setAvatarId] = useState('')
    const [retries, setRetries] = useState(RETRIES_NUMBER)
    const getProfileImageSelector = () =>
        searchTwitterAvatarSelector().querySelector<HTMLElement>('div > :nth-child(2) > div img')

    const [NFTEvent, setNFTEvent] = useState<NFTAvatarEvent>()
    const onUpdate = (data: NFTAvatarEvent) => {
        const timer = setInterval(() => {
            const imgNode = getProfileImageSelector().evaluate()
            const avatarId = getAvatarId(imgNode?.getAttribute('src') ?? '')
            if ((data.avatarId && avatarId && data.avatarId !== avatarId) || retries <= 0) {
                clearInterval(timer)
                setNFTEvent(() => ({
                    userId: data.userId,
                    tokenId: data.tokenId,
                    address: data.address,
                    avatarId: retries <= 0 ? data.avatarId : avatarId,
                }))
            }
            setRetries((retries) => retries - 1)
        }, 500)
    }

    useEffect(() => {
        setAvatarId(getAvatarId(identity.avatar ?? ''))
    }, [identity, getAvatarId])

    useEffect(() => {
        if (!wallet) return

        if (!NFTEvent || !NFTEvent?.address || !NFTEvent?.tokenId) {
            setAvatar(undefined)
            MaskMessage.events.NFTAvatarTimeLineUpdated.sendToAll({
                userId: identity.identifier.userId,
                avatarId: getAvatarId(identity.avatar ?? ''),
                address: '',
                tokenId: '',
            })
            return
        }

        PluginNFTAvatarRPC.saveNFTAvatar(wallet.address, {
            ...NFTEvent,
            updateFlag: retries <= 0,
        } as AvatarMetaDB).then((avatar: AvatarMetaDB | undefined) => {
            setAvatar(avatar)
            if (avatar) setAvatarId(avatar.avatarId)
            MaskMessage.events.NFTAvatarTimeLineUpdated.sendToAll(
                avatar ?? {
                    userId: identity.identifier.userId,
                    avatarId: getAvatarId(identity.avatar ?? ''),
                    address: '',
                    tokenId: '',
                },
            )
        })
    }, [NFTEvent, PluginNFTAvatarRPC, wallet, retries])

    useEffect(() => {
        setAvatar(_avatar)
    }, [_avatar])

    useEffect(() => {
        return MaskMessage.events.NFTAvatarUpdated.on((data) => onUpdate(data))
    }, [onUpdate])

    const onClick = () => {
        if (!avatar) return
        const imgNode = getProfileImageSelector().evaluate()
        const avatarId = getAvatarId(imgNode?.getAttribute('src') ?? '')

        if (avatarId !== avatar.avatarId) {
            setNFTEvent({
                ...avatar,
                avatarId,
            })

            setRetries(RETRIES_NUMBER)
        }
    }

    if (!avatar) return null

    if (identity.identifier.userId === currentUserInfo?.userId && avatar.updateFlag) {
        return (
            <div className={classes.update}>
                <IconButton onClick={onClick}>
                    <UpdateIcon />
                </IconButton>
            </div>
        )
    }
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
