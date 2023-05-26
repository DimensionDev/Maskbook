import { ShadowRootPopper, makeStyles } from '@masknet/theme'
import { NextIDProof, type LensAccount } from '@masknet/web3-providers'
import type { FireflyBaseAPI } from '@masknet/web3-providers/types'
import { Fade } from '@mui/material'
import { isEqual, sortBy, uniqBy } from 'lodash-es'
import { memo, useEffect, useRef, useState } from 'react'
import { emitter } from '../emitter.js'
import { useControlLensPopup } from '../hooks/Lens/useControlLensPopup.js'
import { LensList } from './LensList.js'

const useStyles = makeStyles()((theme) => ({
    popup: {
        position: 'absolute',
        zIndex: 99,
        borderRadius: 16,
        boxShadow:
            theme.palette.mode === 'light'
                ? '0px 4px 30px rgba(0, 0, 0, 0.1)'
                : '0px 4px 30px rgba(255, 255, 255, 0.15)',
    },
}))

export const NextIdLensToFireflyLens = (account: LensAccount): FireflyBaseAPI.LensAccount => {
    return {
        address: account.address,
        name: account.displayName,
        handle: account.handle,
        bio: '',
        url: '',
        profileUri: [],
    }
}

export const LensPopup = memo(() => {
    const { classes } = useStyles()
    const holderRef = useRef<HTMLDivElement>(null)
    const [lens, setLens] = useState<FireflyBaseAPI.LensAccount[]>([])
    const active = useControlLensPopup(holderRef)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>()

    useEffect(() => {
        const unsubscribe = emitter.on('open', async ({ lensAccounts, userId, popupAnchorEl }) => {
            setLens((oldAccounts) => {
                return isEqual(oldAccounts, lensAccounts) ? oldAccounts : lensAccounts
            })
            setAnchorEl(popupAnchorEl)
            const accounts = await NextIDProof.queryAllLens(userId)
            if (!accounts.length) return
            setLens((oldAccounts) => {
                if (accounts.length <= oldAccounts.length) return oldAccounts
                const merged = uniqBy([...oldAccounts, ...accounts.map(NextIdLensToFireflyLens)], (x) => x.handle)
                return sortBy(merged, [(x) => -accounts.findIndex((y) => x.handle === y.handle)])
            })
        })
        return () => void unsubscribe()
    }, [])

    return (
        <Fade in={active} easing="linear" timeout={250}>
            <ShadowRootPopper
                open={!!anchorEl}
                anchorEl={anchorEl}
                keepMounted
                className={classes.popup}
                ref={holderRef}>
                <LensList accounts={lens} />
            </ShadowRootPopper>
        </Fade>
    )
})

LensPopup.displayName = 'LensPopup'
