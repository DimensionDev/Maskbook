import { createReactRootShadowed, Flags, MaskMessage, NFTAvatarEvent, startWatch } from '../../../../utils'
import { searchTwitterAvatarSelector } from '../../utils/selector'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles, useSnackbar } from '@masknet/theme'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@material-ui/core'
import { useCurrentVisitingIdentity } from '../../../../components/DataSource/useActivatedUI'
import {
    AvatarMetaDB,
    saveNFTAvatar,
    setOrClearAvatar,
    useNFTAvatar,
} from '../../../../components/InjectedComponents/NFT/NFTAvatar'
import { updateAvatarImage } from '../../utils/updateAvatarImage'
import { getAvatarId } from '../../utils/user'
import { NFTBadge } from '../../../../components/InjectedComponents/NFT/NFTBadge'

export function injectNFTAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInTwitter />)
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        top: '4px !important',
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
    const [amount, setAmount] = useState('')
    const _avatar = useNFTAvatar(identity.identifier.userId)
    const { enqueueSnackbar } = useSnackbar()
    const [avatar, setAvatar] = useState<AvatarMetaDB | undefined>(_avatar)
    const getParentDom = () =>
        searchTwitterAvatarSelector().querySelector<HTMLElement>('div > :nth-child(2) > div').evaluate()
    const [avatarId, setAvatarId] = useState('')

    const onUpdate = useCallback(
        (data: NFTAvatarEvent) => {
            saveNFTAvatar(data.userId, data.avatarId, data.address, data.tokenId)
                .then((avatar: AvatarMetaDB) => {
                    const parent = getParentDom()
                    if (!parent) return
                    updateAvatarImage(parent, avatar.image ?? '')
                    setAmount(avatar.amount)
                    setAvatar(avatar)
                })
                .catch((error) => {
                    enqueueSnackbar(error.message, { variant: 'error' })
                })
        },
        [enqueueSnackbar],
    )

    useEffect(() => {
        return MaskMessage.events.NFTAvatarUpdated.on((data) => {
            onUpdate(data)
        })
    }, [onUPdate])

    useEffect(() => {
        const _avatarId = getAvatarId(identity.avatar ?? '')
        setAvatarId(_avatarId)
    }, [identity, identity.avatar])

    useEffect(() => {
        setAvatar(_avatar)
        const parent = getParentDom()
        if (!parent) return
        if (!_avatar) return
        setAmount(_avatar?.amount ?? '0')
        updateAvatarImage(parent, _avatar?.image ?? '')
    }, [_avatar])

    const onClick = async () => {
        const parent = getParentDom()
        if (!parent) return
        await setOrClearAvatar(identity.identifier.userId)
        updateAvatarImage(parent)
        setAvatar(undefined)
    }

    if (!avatar) return null
    return (
        <>
            {avatarId === avatar.avatarId ? (
                <NFTBadge avatar={avatar} classes={{ root: classes.root, text: classes.text, icon: classes.icon }} />
            ) : null}
            {Flags.nft_avatar_enabled ? (
                <Button variant="outlined" size="small" className={classes.recover} onClick={() => onClick()}>
                    Cancel NFT Avatar
                </Button>
            ) : null}
        </>
    )
}
