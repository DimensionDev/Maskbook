import { memo, useState } from 'react'
import { type IconProps, Tooltip, useTheme } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../locales/index.js'
import { useSnackbarCallback } from '@masknet/shared'

export interface CopyIconButtonProps extends IconProps {
    text: string
}

export const CopyIconButton = memo<CopyIconButtonProps>(({ text, ...props }) => {
    const t = useI18N()
    const theme = useTheme()
    const [, copyToClipboard] = useCopyToClipboard()
    const [open, setOpen] = useState(false)

    const onCopy = useSnackbarCallback({
        executor: async () => copyToClipboard(text),
        deps: [],
        successText: t.copy_success_of_wallet_address(),
    })

    return (
        <Tooltip
            title={<span style={{ color: theme.palette.text.primary }}>{t.copied()}</span>}
            open={open}
            onMouseLeave={() => setOpen(false)}
            disableFocusListener
            disableTouchListener>
            <Icons.Copy
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onCopy()
                }}
                className={props.className}
            />
        </Tooltip>
    )
})
