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
export const ProfileAvatarBadge: FC<Props> = ({ userId, className, ...rest }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { classes, cx } = useStyles()

    useEffect(() => {
        const button = buttonRef.current
        if (!button) return
        let timer: NodeJS.Timeout
        const enter = () => {
            clearTimeout(timer)
            const button = buttonRef.current
            if (!button) return
            const boundingRect = button.getBoundingClientRect()
            const x = boundingRect.left + boundingRect.width / 2
            const y = boundingRect.top + boundingRect.height + (document.scrollingElement?.scrollTop || 0)
            CrossIsolationMessages.events.requestProfileCard.sendToLocal({
                open: true,
                userId,
                x,
                y,
            })
        }
        const leave = () => {
            timer = setTimeout(() => {
                CrossIsolationMessages.events.requestProfileCard.sendToLocal({
                    open: false,
                })
            }, 2000)
        }
        button.addEventListener('mouseenter', enter)
        button.addEventListener('mouseleave', leave)
        return () => {
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
