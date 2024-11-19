import { memo, useRef, useEffect } from 'react'
import { IconButton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Plugin } from '@masknet/plugin-infra'
import type { FireflyConfigAPI } from '@masknet/web3-providers/types'
import { closePopup, openPopup } from '../../emitter.js'

const BadgesIconSizeMap: Record<Plugin.SiteAdaptor.BadgesSlot, number> = {
    [Plugin.SiteAdaptor.BadgesSlot.Post]: 18,
    [Plugin.SiteAdaptor.BadgesSlot.ProfileName]: 18,
    [Plugin.SiteAdaptor.BadgesSlot.Sidebar]: 16,
}

const useStyles = makeStyles()({
    badge: {
        padding: 0,
        verticalAlign: 'baseline',
    },
    farcaster: {
        marginLeft: -5,
    },
})
interface Props {
    slot: Plugin.SiteAdaptor.BadgesSlot
    lensAccounts: FireflyConfigAPI.LensAccount[]
    farcasterAccounts: FireflyConfigAPI.FarcasterProfile[]
    userId: string
}

export const SocialBadges = memo(function SocialBadges({ slot, lensAccounts, farcasterAccounts, userId }: Props) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { classes } = useStyles()

    useEffect(() => {
        const button = buttonRef.current
        if (!button) return
        let openTimer: ReturnType<typeof setTimeout>
        const enter = () => {
            clearTimeout(openTimer)

            openTimer = setTimeout(() => {
                openPopup({
                    lensAccounts,
                    farcasterAccounts,
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
    }, [lensAccounts, userId, farcasterAccounts])

    useEffect(() => {
        function hide() {
            closePopup({
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
        // eslint-disable-next-line react-compiler/react-compiler
    }, [buttonRef.current])

    const size = BadgesIconSizeMap[slot]
    return (
        <IconButton disableRipple className={classes.badge} ref={buttonRef}>
            {lensAccounts.length ?
                <Icons.DarkLens size={size} />
            :   null}
            {farcasterAccounts.length ?
                <Icons.Farcaster className={classes.farcaster} size={size} />
            :   null}
        </IconButton>
    )
})
