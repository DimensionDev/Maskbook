import { createReactRootShadowed, MaskMessage, startWatch } from '../../../utils'
import { searchTwitterAvatorSelector } from '../utils/selector'
import { getTwitterId } from '../utils/user'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { AvatorMetaData, useNFTAvator } from './profileNFTAvator'
import { useState, useEffect, useCallback } from 'react'
import Services from '../../../extension/service'
import { toNumber } from 'lodash-es'

export function injectNFTAvatorInTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTwitterAvatorSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NFTAvatorInTwitter />)
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        top: 28,
        left: 36,
        width: 60,
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        color: 'white',
    },
}))

interface NFTAvatorInTwitterProps {}
function NFTAvatorInTwitter(props: NFTAvatorInTwitterProps) {
    const { classes } = useStyles()
    const twitterId = getTwitterId()
    const [amount, setAmount] = useState('')
    const avatorMeta = useNFTAvator(twitterId)

    useEffect(() => {
        if (!avatorMeta) return
        setAmount(avatorMeta.amount)
    }, [avatorMeta])

    const onUpdate = useCallback((data: AvatorMetaData) => {
        if (!data.image) return
        UpdateAvator(data.image!)
        setAmount(data.amount)
    }, [])

    useEffect(() => {
        return MaskMessage.events.NFTAvatorUpdated.on((data) => onUpdate(data))
    }, [])

    if (toNumber(amount) === 0) return null
    return <div className={classes.root}>{amount}</div>
}

async function UpdateAvator(image: string) {
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
