import { memo, useRef, useEffect } from 'react'
import { IconButton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Plugin } from '@masknet/plugin-infra'
import { closeFarcasterPopup, openFarcasterPopup } from '../../emitter.js'
import type { FireflyConfigAPI } from '@masknet/web3-providers/types'

const FarcasterIconSizeMap: Record<Plugin.SiteAdaptor.FarcasterSlot, number> = {
    [Plugin.SiteAdaptor.FarcasterSlot.Post]: 18,
    [Plugin.SiteAdaptor.FarcasterSlot.ProfileName]: 18,
    [Plugin.SiteAdaptor.FarcasterSlot.Sidebar]: 16,
}

const useStyles = makeStyles()({
    badge: {
        padding: 0,
        verticalAlign: 'baseline',
    },
})
interface Props {
    slot: Plugin.SiteAdaptor.FarcasterSlot
    accounts: FireflyConfigAPI.FarcasterProfile[]
    userId: string
}

export const FarcasterBadge = memo(({ slot, accounts, userId }: Props) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { classes } = useStyles()

    useEffect(() => {
        const button = buttonRef.current
        if (!button) return
        let openTimer: ReturnType<typeof setTimeout>
        const enter = () => {
            clearTimeout(openTimer)

            openTimer = setTimeout(() => {
                openFarcasterPopup({
                    accounts,
                    userId,
                    popupAnchorEl: buttonRef.current,
                })
            }, 200)
        }
        const leave = () => {
            clearTimeout(openTimer)
        }
        button.addEventListener('mouseenter', enter)
        button.addEventListener('mouseleave', leave)
        return () => {
            clearTimeout(openTimer)
            button.removeEventListener('mouseenter', enter)
            button.removeEventListener('mouseleave', leave)
        }
    }, [accounts, userId])

    useEffect(() => {
        function hide() {
            closeFarcasterPopup({
                popupAnchorEl: buttonRef.current,
            })
        }
        const ob = new IntersectionObserver((entries) => {
            if (entries[0].intersectionRatio !== 0) return
            hide()
        })
        if (buttonRef.current) {
            ob.observe(buttonRef.current)
        }
        return () => {
            hide()
            ob.disconnect()
        }
    }, [buttonRef.current])

    return (
        <IconButton disableRipple className={classes.badge} ref={buttonRef}>
            <Icons.Farcaster size={FarcasterIconSizeMap[slot]} />
        </IconButton>
    )
})

FarcasterBadge.displayName = 'FarcasterBadge'
