import { memo, type FC, useRef, useEffect } from 'react'
import { IconButton } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Plugin } from '@masknet/plugin-infra'
import { type LensAccount } from '@masknet/web3-providers'
import { Icons } from '@masknet/icons'
import { openPopup } from '../emitter.js'

const LensIconSizeMap: Record<Plugin.SNSAdaptor.LensSlot, number> = {
    [Plugin.SNSAdaptor.LensSlot.Post]: 18,
    [Plugin.SNSAdaptor.LensSlot.ProfileName]: 20,
    [Plugin.SNSAdaptor.LensSlot.Sidebar]: 16,
}

const useStyles = makeStyles()((theme) => ({
    badge: {},
}))
interface Props {
    slot: Plugin.SNSAdaptor.LensSlot
    accounts: LensAccount[]
}

export const LensBadge: FC<Props> = memo(({ slot, accounts }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { classes } = useStyles()

    useEffect(() => {
        const button = buttonRef.current
        if (!button) return
        let closeTimer: NodeJS.Timeout
        let openTimer: NodeJS.Timeout
        const enter = () => {
            clearTimeout(openTimer)
            clearTimeout(closeTimer)

            openTimer = setTimeout(() => {
                openPopup(button.getBoundingClientRect().toJSON(), accounts)
            }, 200)
        }
        button.addEventListener('mouseenter', enter)
        return () => {
            clearTimeout(closeTimer)
            clearTimeout(openTimer)
            button.removeEventListener('mouseenter', enter)
        }
    }, [accounts])

    return (
        <IconButton disableRipple className={classes.badge} ref={buttonRef}>
            <Icons.Lens size={LensIconSizeMap[slot]} />
        </IconButton>
    )
})
