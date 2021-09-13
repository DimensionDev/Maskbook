import { createReactRootShadowed, Flags, MaskMessage, NFTAVatarEvent, startWatch } from '../../../utils'
import { searchTwitterAvatarSelector } from '../utils/selector'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles, useSnackbar } from '@masknet/theme'
import { useState, useEffect, useCallback } from 'react'
import { Typography, Button } from '@material-ui/core'
import { NFTAvatarAmountIcon } from '@masknet/icons'
import {
    AvatarMetaDB,
    saveNFTAvatar,
    setOrClearAvatar,
    useNFTAvatar,
} from '../../../components/InjectedComponents/NFTAvatar'
import { updateAvatarImage } from '../utils/updateAvatarImage'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'
import { getAvatarId } from '../utils/user'

export function injectNFTAvatarInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatarSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatarInTwitter />)
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        top: 12,
        left: 0,
        width: 134,
        textAlign: 'center',
        color: 'white',
    },

    nftImage: {
        width: '100%',
        height: 33,
        paddingLeft: 16,
    },
    wrapper: {
        position: 'absolute',
        width: '100%',
        left: 0,
        top: 16,
        display: 'flex',
        justifyContent: 'center',
    },
    nftLogo: {},
    amount: {
        color: 'white',
        fontSize: 14,
        fontWeight: 700,
        textShadow:
            '1px 1px black, 1px 0px black, 0px 1px black, -1px 0px black, 0px -1px black, -1px -1px black, 1px -1px black, -1px 1px black',

        whiteSpace: 'nowrap',
        lineHeight: 1.1,
    },
    amountWrapper: {
        background:
            'linear-gradient(106.15deg, #FF0000 5.97%, #FF8A00 21.54%, #FFC700 42.35%, #52FF00 56.58%, #00FFFF 73.01%, #0038FF 87.8%, #AD00FF 101.49%, #FF0000 110.25%)',
        borderRadius: 3,
        minWidth: 72,
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
        (data: NFTAVatarEvent) => {
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
    }, [])

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
                <div className={classes.root}>
                    <div className={classes.nftLogo}>
                        <NFTAvatarAmountIcon className={classes.nftImage} />
                    </div>
                    <div className={classes.wrapper}>
                        <div className={classes.amountWrapper}>
                            <Typography align="center" className={classes.amount}>
                                {`${amount} ETH`}
                            </Typography>
                        </div>
                    </div>
                </div>
            ) : null}
            {Flags.nft_avatar_enabled ? (
                <Button variant="outlined" size="small" className={classes.recover} onClick={() => onClick()}>
                    Cancel NFT Avatar
                </Button>
            ) : null}
        </>
    )
}
