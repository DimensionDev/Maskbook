import { memo, useCallback, useState } from 'react'
import { IconProps, Tooltip } from '@mui/material'
import { useI18N } from '../../../../utils'
import { CopyIcon } from '@masknet/icons'
import { useCopyToClipboard } from 'react-use'

export interface CopyIconButtonProps extends IconProps {
    text: string
}

export const CopyIconButton = memo<CopyIconButtonProps>(({ text, ...props }) => {
    const { t } = useI18N()
    const [, copyToClipboard] = useCopyToClipboard()
    const [open, setOpen] = useState(false)

    const onCopy = useCallback(() => {
        copyToClipboard(text)
        setOpen(true)
        // Close tooltip after five seconds of copying
        setTimeout(() => {
            setOpen(false)
        }, 5000)
    }, [text, copyToClipboard])

    return (
        <Tooltip
            title={t('copied')}
            open={open}
            onMouseLeave={() => setOpen(false)}
            disableFocusListener
            disableTouchListener>
            <CopyIcon onClick={onCopy} className={props.className} />
        </Tooltip>
    )
})
