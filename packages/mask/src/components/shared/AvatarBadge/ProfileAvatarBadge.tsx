import { Icons } from '@masknet/icons'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { IconButton, type IconButtonProps } from '@mui/material'
import { type FC, useEffect, useRef } from 'react'

const useStyles = makeStyles()((theme) => ({
    badge: {
        padding: 0,
        boxShadow: `0 0 0 1px ${theme.palette.maskColor.bottom}`,
    },
}))

interface Props extends IconButtonProps {
    userId: string
}
export const ProfileAvatarBadge: FC<Props> = ({ userId, className, ...rest }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { classes, cx } = useStyles()

    useEffect(() => {
        const button = buttonRef.current
        if (!button) return
        let closeTimer: NodeJS.Timeout
        let openTimer: NodeJS.Timeout
        const enter = () => {
            clearTimeout(openTimer)
            clearTimeout(closeTimer)

            openTimer = setTimeout(() => {
                CrossIsolationMessages.events.profileCardEvent.sendToLocal({
                    open: true,
                    userId,
                    badgeBounding: button.getBoundingClientRect(),
                })
            }, 200)
        }
        const leave = () => {
            CrossIsolationMessages.events.profileCardEvent.sendToLocal({
                open: false,
            })
        }
        button.addEventListener('mouseenter', enter)
        button.addEventListener('mouseleave', leave)
        // Other badges might want to open the profile card
        const unsubscribe = CrossIsolationMessages.events.profileCardEvent.on((event) => {
            if (!event.open) return
            clearTimeout(closeTimer)
        })
        return () => {
            clearTimeout(closeTimer)
            clearTimeout(openTimer)
            button.removeEventListener('mouseenter', enter)
            button.removeEventListener('mouseleave', leave)
            unsubscribe()
        }
    }, [userId])

    return (
        <IconButton disableRipple className={cx(classes.badge, className)} {...rest} ref={buttonRef}>
            <Icons.MaskBlue size={16} />
        </IconButton>
    )
}
