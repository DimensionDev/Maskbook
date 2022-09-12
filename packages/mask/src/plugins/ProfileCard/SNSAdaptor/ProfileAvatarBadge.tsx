import { Icons } from '@masknet/icons'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { IconButton, IconButtonProps } from '@mui/material'
import { FC, useEffect, useRef } from 'react'

const useStyles = makeStyles()((theme) => ({
    badge: {
        padding: 0,
        boxShadow: `0 0 0 1px ${theme.palette.maskColor.bottom}`,
    },
}))

interface Props extends IconButtonProps {
    userId: string
}
let closeTimer: NodeJS.Timeout
let openTimer: NodeJS.Timeout
export const ProfileAvatarBadge: FC<Props> = ({ userId, className, ...rest }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { classes, cx } = useStyles()

    useEffect(() => {
        const button = buttonRef.current
        if (!button) return
        const enter = () => {
            clearTimeout(openTimer)
            clearTimeout(closeTimer)
            const button = buttonRef.current
            if (!button) return
            openTimer = setTimeout(() => {
                CrossIsolationMessages.events.requestProfileCard.sendToLocal({
                    open: true,
                    userId,
                    badgeBounding: button.getBoundingClientRect(),
                })
            }, 200)
        }
        const leave = () => {
            clearTimeout(openTimer)
            clearTimeout(closeTimer)
            closeTimer = setTimeout(() => {
                CrossIsolationMessages.events.requestProfileCard.sendToLocal({
                    open: false,
                })
            }, 2000)
        }
        button.addEventListener('mouseenter', enter)
        button.addEventListener('mouseleave', leave)
        return () => {
            clearTimeout(closeTimer)
            clearTimeout(openTimer)
            button.removeEventListener('mouseenter', enter)
            button.removeEventListener('mouseleave', leave)
        }
    }, [])

    return (
        <IconButton disableRipple className={cx(classes.badge, className)} {...rest} ref={buttonRef}>
            <Icons.MaskBlue size={16} />
        </IconButton>
    )
}
