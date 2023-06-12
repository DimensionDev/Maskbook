import { useEffect, useRef } from 'react'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import type { SocialIdentity } from '@masknet/shared-base'
import { TrendingAPI } from '@masknet/web3-providers/types'
import { IconButton, type IconButtonProps } from '@mui/material'
import { PluginTraderMessages } from '../../../plugins/Trader/messages.js'

const useStyles = makeStyles()((theme) => ({
    badge: {
        padding: 0,
        boxShadow: `0 0 0 1px ${theme.palette.maskColor.bottom}`,
    },
}))

interface Props extends IconButtonProps {
    address: string
    userId: string
    identity?: SocialIdentity
}
export const CollectionProjectAvatarBadge = ({ address, userId, className, identity, ...rest }: Props) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { classes, cx } = useStyles()

    useEffect(() => {
        const button = buttonRef.current
        if (!button) return

        let openTimer: NodeJS.Timeout
        const enter = () => {
            clearTimeout(openTimer)
            openTimer = setTimeout(() => {
                PluginTraderMessages.trendingAnchorObserved.sendToLocal({
                    name: userId,
                    identity,
                    address,
                    anchorBounding: button.getBoundingClientRect(),
                    anchorEl: buttonRef.current,
                    type: TrendingAPI.TagType.HASH,
                    isCollectionProjectPopper: true,
                })
            }, 200)
        }

        button.addEventListener('mouseenter', enter)

        return () => {
            clearTimeout(openTimer)
            button.removeEventListener('mouseenter', enter)
        }
    }, [address, userId, JSON.stringify(identity)])

    return (
        <IconButton disableRipple className={cx(classes.badge, className)} {...rest} ref={buttonRef}>
            <Icons.MaskBlue size={16} />
        </IconButton>
    )
}
