import { isEqual } from 'lodash-es'
import { memo, useEffect, useRef, useState } from 'react'
import { ShadowRootPopper, makeStyles } from '@masknet/theme'
import type { FireflyConfigAPI } from '@masknet/web3-providers/types'
import { Fade } from '@mui/material'
import { emitter } from '../../emitter.js'
import { useControlFarcasterPopup } from '../../hooks/Farcaster/useControlFarcasterPopup.js'
import { FarcasterList } from './FarcasterList.js'

const useStyles = makeStyles()((theme) => ({
    popup: {
        position: 'absolute',
        zIndex: 99,
        borderRadius: 16,
        boxShadow:
            theme.palette.mode === 'light' ?
                '0px 4px 30px rgba(0, 0, 0, 0.1)'
            :   '0px 4px 30px rgba(255, 255, 255, 0.15)',
    },
}))

export const FarcasterPopup = memo(() => {
    const { classes } = useStyles()
    const holderRef = useRef<HTMLDivElement>(null)
    const [accounts, setAccounts] = useState<FireflyConfigAPI.FarcasterProfile[]>([])
    const active = useControlFarcasterPopup(holderRef)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>()
    const anchorElRef = useRef<HTMLElement | null>()

    useEffect(() => {
        const unsubscribeOpen = emitter.on('open-farcaster', async ({ accounts, popupAnchorEl }) => {
            setAccounts((oldAccounts) => {
                return isEqual(oldAccounts, accounts) ? oldAccounts : accounts
            })
            setAnchorEl(popupAnchorEl)
            anchorElRef.current = popupAnchorEl
        })
        const unsubscribeClose = emitter.on('close-farcaster', ({ popupAnchorEl }) => {
            if (popupAnchorEl !== anchorElRef.current) return
            setAnchorEl(null)
        })
        return () => {
            unsubscribeOpen()
            unsubscribeClose()
        }
    }, [])

    return (
        <Fade in={active} easing="linear" timeout={250}>
            <ShadowRootPopper
                placeholder={undefined}
                open={!!anchorEl}
                anchorEl={anchorEl}
                keepMounted
                className={classes.popup}
                ref={holderRef}>
                <FarcasterList accounts={accounts} />
            </ShadowRootPopper>
        </Fade>
    )
})

FarcasterPopup.displayName = 'FarcasterPopup'
