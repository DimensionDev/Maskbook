import { createReactRootShadowed, MaskMessage, startWatch } from '../../../utils'
import { searchTwitterAvatarSelector } from '../utils/selector'
import { getTwitterId } from '../utils/user'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { AvatarMetaData, saveNFTAvatar, useNFTAvatar } from './profileNFTAvatar'
import { useState, useEffect, useCallback } from 'react'
import Services from '../../../extension/service'
import { toNumber } from 'lodash-es'
import { Typography } from '@material-ui/core'
import { NFTAvatarAmountIcon } from '@masknet/icons'

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
        top: 15,
        display: 'flex',
        justifyContent: 'center',
    },
    nftLogo: {},
    amount: {
        color: 'white',
        fontSize: 14,
        fontWeight: 700,
        WebkitTextStrokeColor: 'black',
        WebkitTextStrokeWidth: 1,

        whiteSpace: 'nowrap',
    },
    amountWrapper: {
        backgroundImage: `url(${new URL('./nftamount.png', import.meta.url)})`,
        backgroundRepeat: 'no-repeat',
        minWidth: 72,
    },
}))

interface NFTAvatarInTwitterProps {}
function NFTAvatarInTwitter(props: NFTAvatarInTwitterProps) {
    const { classes } = useStyles()
    const twitterId = getTwitterId()
    const [amount, setAmount] = useState('')
    const avatarMeta = useNFTAvatar(twitterId)

    const onUpdate = useCallback((data: AvatarMetaData) => {
        if (!data.image) return
        updateAvatar(data.image!)
        setAmount(data.amount)
        saveNFTAvatar(data)
    }, [])

    useEffect(() => {
        return MaskMessage.events.NFTAvatarUpdated.on((data) => onUpdate(data))
    }, [])

    useEffect(() => {
        setAmount(avatarMeta?.amount ?? '0')
        updateAvatar(avatarMeta?.image ?? '')
    }, [avatarMeta])

    if (toNumber(amount) === 0) return null
    return (
        <div className={classes.root}>
            <div className={classes.nftLogo}>
                <NFTAvatarAmountIcon className={classes.nftImage} />
            </div>
            <div className={classes.wrapper}>
                <div className={classes.amountWrapper}>
                    <Typography align="center" className={classes.amount}>
                        {amount} ETH
                    </Typography>
                </div>
            </div>
        </div>
    )
}

async function updateAvatar(image: string) {
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
}
