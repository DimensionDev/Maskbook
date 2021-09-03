import { createReactRootShadowed, MaskMessage, startWatch } from '../../../utils'
import { searchTwitterAvatorSelector } from '../utils/selector'
import { getTwitterId } from '../utils/user'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { AvatorMetaData, saveNFTAvator, useNFTAvator } from './profileNFTAvator'
import { useState, useEffect, useCallback } from 'react'
import Services from '../../../extension/service'
import { toNumber } from 'lodash-es'
import { Typography } from '@material-ui/core'
import { NFTAvatorAmountIcon } from '@masknet/icons'

export function injectNFTAvatorInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatorSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatorInTwitter />)
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        top: 16,
        left: 36,
        width: 60,
        textAlign: 'center',
        color: 'white',
    },

    nftImage: {
        width: '100%',
        height: 'auto',
    },
    wrapper: {
        position: 'absolute',
        width: '100%',
        left: 0,
        top: 12,
    },
    amount: {
        color: 'white',
        fontSize: 12,
        fontWeight: 700,
    },
}))

interface NFTAvatorInTwitterProps {}
function NFTAvatorInTwitter(props: NFTAvatorInTwitterProps) {
    const { classes } = useStyles()
    const twitterId = getTwitterId()
    const [amount, setAmount] = useState('')
    const avatorMeta = useNFTAvator(twitterId)

    const onUpdate = useCallback((data: AvatorMetaData) => {
        if (!data.image) return
        updateAvator(data.image!)
        setAmount(data.amount)
        saveNFTAvator(data)
    }, [])

    useEffect(() => {
        return MaskMessage.events.NFTAvatorUpdated.on((data) => onUpdate(data))
    }, [])

    useEffect(() => {
        setAmount(avatorMeta?.amount ?? '0')
        updateAvator(avatorMeta?.image ?? '')
    }, [avatorMeta])

    if (toNumber(amount) === 0) return null
    return (
        <div className={classes.root}>
            <NFTAvatorAmountIcon className={classes.nftImage} />
            <div className={classes.wrapper}>
                <Typography align="center" className={classes.amount}>
                    {amount} ETH
                </Typography>
            </div>
        </div>
    )
}

async function updateAvator(image: string) {
    const blob = await Services.Helper.fetch(image)
    if (!blob) return
    const blobURL = URL.createObjectURL(blob)
    const avatorElement = searchTwitterAvatorSelector()
        .querySelector('div > :nth-child(2) > div > :first-child')
        .evaluate() as HTMLElement

    avatorElement.style.backgroundImage = `url("${blobURL.toString()}")`
    const avatorImage = searchTwitterAvatorSelector()
        .querySelector('div > :nth-child(2) > div > img')
        .evaluate() as HTMLElement
    if (!avatorImage) return
    avatorImage.setAttribute('src', blobURL.toString())
}
