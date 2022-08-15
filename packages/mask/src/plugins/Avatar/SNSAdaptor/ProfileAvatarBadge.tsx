import { Icons } from '@masknet/icons'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { IconButton, IconButtonProps } from '@mui/material'
import { FC, MouseEventHandler, useCallback, useLayoutEffect, useRef, useState } from 'react'

interface Props extends IconButtonProps {
    userId: string
}

export const ProfileAvatarBadge: FC<Props> = ({ userId, ...rest }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const openProfileCard: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            event.stopPropagation()
            CrossIsolationMessages.events.requestOpenProfileCard.sendToLocal({
                userId,
                x: position.x,
                y: position.y,
            })
        },
        [userId, position],
    )

    useLayoutEffect(() => {
        const button = buttonRef.current
        if (!button) return
        const boundingRect = button.getBoundingClientRect()
        const x = boundingRect.left + boundingRect.width / 2
        const y = boundingRect.top + boundingRect.height + (document.scrollingElement?.scrollTop || 0)
        setPosition((pos) => {
            if (pos.x === x && pos.y === y) return pos
            return { x, y }
        })
    }, [])
    return (
        <IconButton disableRipple sx={{ padding: 0 }} {...rest} onClick={openProfileCard} ref={buttonRef}>
            <Icons.MaskBlue size={12} />
        </IconButton>
    )
}
