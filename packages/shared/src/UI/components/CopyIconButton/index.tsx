// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { memo, useCallback, useState } from 'react'
import { IconProps, Tooltip } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useCopyToClipboard } from 'react-use'
import { useSharedI18N } from '../../../index.js'

export interface CopyIconButtonProps extends IconProps {
    text: string
}

export const CopyIconButton = memo<CopyIconButtonProps>(({ text, ...props }) => {
    const t = useSharedI18N()
    const [, copyToClipboard] = useCopyToClipboard()
    const [open, setOpen] = useState(false)

    const onCopy = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            copyToClipboard(text)
            setOpen(true)
            // Close tooltip after five seconds of copying
            setTimeout(() => {
                setOpen(false)
            }, 5000)
        },
        [text, copyToClipboard],
    )

    return (
        <Tooltip
            title={t.copied()}
            open={open}
            onMouseLeave={() => setOpen(false)}
            disableFocusListener
            disableTouchListener>
            <Icons.PopupCopy onClick={onCopy} className={props.className} />
        </Tooltip>
    )
})
