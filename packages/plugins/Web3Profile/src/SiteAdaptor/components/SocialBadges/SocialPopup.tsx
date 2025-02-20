import { isEqual, sortBy, uniqBy } from 'lodash-es'
import { memo, useEffect, useRef, useState } from 'react'
import { ShadowRootPopper, makeStyles } from '@masknet/theme'
import { Web3Bio } from '@masknet/web3-providers'
import type { FireflyConfigAPI } from '@masknet/web3-providers/types'
import { Fade, List } from '@mui/material'
import { emitter } from '../../emitter.js'
import { LensList } from './LensList.js'
import { FarcasterList } from './FarcasterList.js'
import { Web3BioProfileToFireflyLens } from '../../../utils.js'
import { useControlSocialPopup } from '../../hooks/useControlSocialPopup.js'

const useStyles = makeStyles()((theme) => {
    const isDark = theme.palette.mode === 'dark'
    return {
        popup: {
            position: 'absolute',
            zIndex: 99,
            borderRadius: 16,
            boxShadow:
                theme.palette.mode === 'light' ?
                    '0px 4px 30px rgba(0, 0, 0, 0.1)'
                :   '0px 4px 30px rgba(255, 255, 255, 0.15)',
        },
        list: {
            backgroundColor: isDark ? '#030303' : theme.palette.common.white,
            maxWidth: 320,
            // Show up to 6 item
            maxHeight: 244,
            overflow: 'auto',
            minWidth: 240,
            padding: theme.spacing(1.5),
            boxSizing: 'border-box',
            borderRadius: 16,
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
    }
})

export const SocialPopup = memo(function SocialPopup() {
    const { classes } = useStyles()
    const holderRef = useRef<HTMLDivElement>(null)
    const [lensAccounts, setLensAccounts] = useState<FireflyConfigAPI.LensAccount[]>([])
    const [farcasterAccounts, setFarcasterAccounts] = useState<FireflyConfigAPI.FarcasterProfile[]>([])
    const active = useControlSocialPopup(holderRef)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>()
    const anchorElRef = useRef<HTMLElement | null>(undefined)

    useEffect(() => {
        const unsubscribeOpen = emitter.on('open', async ({ lensAccounts, farcasterAccounts, popupAnchorEl }) => {
            setLensAccounts((old) => (isEqual(old, lensAccounts) ? old : lensAccounts))
            setFarcasterAccounts((old) => (isEqual(old, farcasterAccounts) ? old : farcasterAccounts))
            setAnchorEl(popupAnchorEl)
            anchorElRef.current = popupAnchorEl
            if (lensAccounts[0]?.handle) {
                const accounts = await Web3Bio.getAllLens(lensAccounts[0].handle)
                if (!accounts.length) return
                setLensAccounts((oldAccounts) => {
                    if (accounts.length <= oldAccounts.length) return oldAccounts
                    const merged = uniqBy(
                        [...oldAccounts, ...accounts.map(Web3BioProfileToFireflyLens)],
                        (x) => x.handle,
                    )
                    return sortBy(merged, [(x) => -accounts.findIndex((y) => x.handle === y.identity)])
                })
            }
        })
        const unsubscribeClose = emitter.on('close', ({ popupAnchorEl }) => {
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
                open={!!anchorEl}
                anchorEl={anchorEl}
                keepMounted
                className={classes.popup}
                ref={holderRef}>
                <List className={classes.list}>
                    {lensAccounts.length ?
                        <LensList accounts={lensAccounts} />
                    :   null}
                    {farcasterAccounts.length ?
                        <FarcasterList accounts={farcasterAccounts} />
                    :   null}
                </List>
            </ShadowRootPopper>
        </Fade>
    )
})
