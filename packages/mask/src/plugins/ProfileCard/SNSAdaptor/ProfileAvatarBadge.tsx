import { Icons } from '@masknet/icons'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { IconButton, IconButtonProps } from '@mui/material'
import { FC, useEffect, useRef } from 'react'

interface Props extends IconButtonProps {
    userId: string
}

export const ProfileAvatarBadge: FC<Props> = ({ userId, ...rest }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        const enter = () => {
            const button = buttonRef.current
            if (!button) return
            const boundingRect = button.getBoundingClientRect()
            const x = boundingRect.left + boundingRect.width / 2
            const y = boundingRect.top + boundingRect.height + (document.scrollingElement?.scrollTop || 0)
            CrossIsolationMessages.events.requestOpenProfileCard.sendToLocal({
                userId,
                x,
                y,
            })
        }
        buttonRef.current?.addEventListener('mouseenter', enter)
        return () => {
            buttonRef.current?.removeEventListener('mouseenter', enter)
        }
    }, [])

    return (
        <IconButton disableRipple sx={{ padding: 0 }} {...rest} ref={buttonRef}>
            <Icons.MaskBlue size={16} />
        </IconButton>
    )
}
