import { memo, type FC, useRef, useEffect } from 'react'
import { IconButton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Plugin } from '@masknet/plugin-infra'
import type { FireflyBaseAPI } from '@masknet/web3-providers/types'
import { openPopup } from '../emitter.js'

const LensIconSizeMap: Record<Plugin.SNSAdaptor.LensSlot, number> = {
    [Plugin.SNSAdaptor.LensSlot.Post]: 18,
    [Plugin.SNSAdaptor.LensSlot.ProfileName]: 18,
    [Plugin.SNSAdaptor.LensSlot.Sidebar]: 16,
}

const useStyles = makeStyles()({
    badge: {
        padding: 0,
        verticalAlign: 'baseline',
    },
})
interface Props {
    slot: Plugin.SNSAdaptor.LensSlot
    accounts: FireflyBaseAPI.LensAccount[]
}

export const LensBadge: FC<Props> = memo(({ slot, accounts }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { classes } = useStyles()

    useEffect(() => {
        const button = buttonRef.current
        if (!button) return
        let openTimer: NodeJS.Timeout
        const enter = () => {
            clearTimeout(openTimer)

            openTimer = setTimeout(() => {
                openPopup(button.getBoundingClientRect().toJSON(), accounts)
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
    }, [accounts])

    return (
        <IconButton disableRipple className={classes.badge} ref={buttonRef}>
            <Icons.Lens size={LensIconSizeMap[slot]} />
        </IconButton>
    )
})

LensBadge.displayName = 'LensBadge'
