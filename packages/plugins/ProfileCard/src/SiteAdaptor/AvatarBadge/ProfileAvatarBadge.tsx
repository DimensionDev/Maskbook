import { Icons } from '@masknet/icons'
import { CrossIsolationMessages, stopPropagation } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { IconButton, type IconButtonProps } from '@mui/material'
import { useEffect, useRef } from 'react'

const useStyles = makeStyles()((theme) => ({
    badge: {
        padding: 0,
        boxShadow: `0 0 0 1px ${theme.palette.maskColor.bottom}`,
    },
}))

interface Props extends IconButtonProps {
    userId: string
    address: string
}
export function ProfileAvatarBadge({ userId, address, className, ...rest }: Props) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { classes, cx } = useStyles()

    useEffect(() => {
        const button = buttonRef.current
        if (!button) return
        let openTimer: ReturnType<typeof setTimeout>
        const enter = () => {
            clearTimeout(openTimer)

            openTimer = setTimeout(() => {
                CrossIsolationMessages.events.profileCardEvent.sendToLocal({
                    open: true,
                    address,
                    userId,
                    anchorBounding: button.getBoundingClientRect(),
                    anchorEl: button,
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
        })
        return () => {
            clearTimeout(openTimer)
            button.removeEventListener('mouseenter', enter)
            button.removeEventListener('mouseleave', leave)
            unsubscribe()
        }
    }, [userId, address])

    return (
        <IconButton
            disableRipple
            className={cx(classes.badge, className)}
            {...rest}
            onClick={stopPropagation}
            ref={buttonRef}>
            <Icons.MaskBlue size={16} />
        </IconButton>
    )
}
