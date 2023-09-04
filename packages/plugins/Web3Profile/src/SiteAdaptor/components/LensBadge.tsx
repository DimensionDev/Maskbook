import { memo, useRef, useEffect } from 'react'
import { IconButton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Plugin } from '@masknet/plugin-infra'
import type { FireflyBaseAPI } from '@masknet/web3-providers/types'
import { openPopup } from '../emitter.js'

const LensIconSizeMap: Record<Plugin.SiteAdaptor.LensSlot, number> = {
    [Plugin.SiteAdaptor.LensSlot.Post]: 18,
    [Plugin.SiteAdaptor.LensSlot.ProfileName]: 18,
    [Plugin.SiteAdaptor.LensSlot.Sidebar]: 16,
}

const useStyles = makeStyles()({
    badge: {
        padding: 0,
        verticalAlign: 'baseline',
    },
})
interface Props {
    slot: Plugin.SiteAdaptor.LensSlot
    accounts: FireflyBaseAPI.LensAccount[]
    userId: string
}

export const LensBadge = memo(({ slot, accounts, userId }: Props) => {
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
                    lensAccounts: accounts,
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

    return (
        <IconButton disableRipple className={classes.badge} ref={buttonRef}>
            <Icons.Lens size={LensIconSizeMap[slot]} />
        </IconButton>
    )
})

LensBadge.displayName = 'LensBadge'
