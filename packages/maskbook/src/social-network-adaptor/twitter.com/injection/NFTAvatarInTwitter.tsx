import { createReactRootShadowed, Flags, MaskMessage, NFTAVatarEvent, startWatch } from '../../../utils'
import { searchTwitterAvatarSelector } from '../utils/selector'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useState, useEffect, useCallback } from 'react'
import { Typography, Button } from '@material-ui/core'
import { NFTAvatarAmountIcon } from '@masknet/icons'
import {
    AvatarMetaDB,
    clearAvatar,
    getNFTAvator,
    saveNFTAvatar,
    useNFTAvatar,
} from '../../../components/InjectedComponents/NFTAvatar'
import { getTwitterId } from '../utils/user'

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
        textShadow: '2px 1px black',
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
        right: 115,
        top: 0,
    },
}))

interface NFTAvatarInTwitterProps {}
function NFTAvatarInTwitter(props: NFTAvatarInTwitterProps) {
    const { classes } = useStyles()
    const twitterId = getTwitterId()
    const [amount, setAmount] = useState('')
    const avatarMeta = useNFTAvatar(twitterId)
    const parent = searchTwitterAvatarSelector().querySelector<HTMLElement>('div > :nth-child(2) > div').evaluate()
    const onUpdate = useCallback(
        (data: NFTAVatarEvent) => {
            console.log('aaaaabbbbbbbbb')
            saveNFTAvatar(data.userId, data.avatarId ?? data.userId, data.address, data.tokenId).then(
                (avatar: AvatarMetaDB) => {
                    console.log('----------------------------------------')
                    console.log(avatar)

                    if (!parent) return
                    updateAvatarImage(parent, avatar.image ?? '')
                    setAmount(avatar.amount)
                },
            )
        },
        [parent],
    )
    useEffect(() => {
        return MaskMessage.events.NFTAvatarUpdated.on((data) => {
            console.log('aaaaaaaaaaaaaaaaaaaaaaaaaa')
            console.log(data)
            onUpdate(data)
        })
    }, [])

    useEffect(() => {
        if (!parent) return
        setAmount(avatarMeta?.amount ?? '0')
        updateAvatarImage(parent, avatarMeta?.image ?? '')
    }, [avatarMeta, parent, twitterId])

    const onClick = async () => {
        await clearAvatar(twitterId)
    }

    if (!avatarMeta) return null
    if (!Flags.nft_avatar_enabled) return null
    return (
        <>
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

            <Button variant="outlined" size="small" className={classes.recover} onClick={() => onClick()}>
                Cancel NFT Avatar
            </Button>
        </>
    )
}

export function updateAvatarFromDB(parent?: HTMLElement, twitterId?: string) {
    if (!parent || !twitterId) return
    getNFTAvator(twitterId).then((avatarMeta: AvatarMetaDB) => {
        updateAvatarImage(parent, avatarMeta.image ?? '')
    })
}

function recovAvatar(parent: HTMLElement) {
    const avatar = parent.firstChild as HTMLDivElement
    if (avatar) {
        if (avatar.hasAttribute('avatar')) {
            avatar.style.backgroundImage = avatar.getAttribute('avatar') ?? ''
            avatar.removeAttribute('avatar')
        }
    }

    const image = parent.lastChild as HTMLDivElement
    if (image) {
        if (image.hasAttribute('avatar')) {
            image.setAttribute('src', image.getAttribute('avatar') ?? '')
            image.removeAttribute('avatar')
        }
    }
}

export function updateAvatarImage(parent: HTMLElement, image?: string) {
    if (!Flags.nft_avatar_enabled) {
        return
    }

    if (!image) {
        recovAvatar(parent)
        return
    }
    /*
    const blob = await Services.Helper.fetch(image)
    if (!blob) return
    const blobURL = URL.createObjectURL(blob)

    const avatarElement = searchTwitterAvatarSelector()
        .querySelector('div > :nth-child(2) > div > :first-child')
        .evaluate() as HTMLElement

    avatarElement.style.backgroundImage = `url("${blobURL.toString()}")`
    const avatarImage = searchTwitterAvatarSelector()
        .querySelector('div > :nth-child(2) > div > img')
        .evaluate() as HTMLElement
    if (!avatarImage) return
    avatarImage.setAttribute('src', blobURL.toString())
    */
    const avatar = parent.firstChild as HTMLDivElement
    if (avatar) {
        if (!avatar.hasAttribute('avatar')) {
            avatar.setAttribute('avatar', avatar.style.backgroundImage)
        }
        avatar.style.backgroundImage = `url(${new URL(image, import.meta.url)})`
    }
    const ele = parent.lastChild as HTMLDivElement
    console.log(ele)
    if (ele) {
        if (!ele.hasAttribute('avatar')) {
            ele.setAttribute('avatar', ele.getAttribute('src') ?? '')
        }
        ele.setAttribute('src', `url(${new URL(image, import.meta.url)})`)
    }
}
