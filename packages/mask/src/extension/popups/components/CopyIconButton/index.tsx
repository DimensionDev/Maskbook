// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { memo, useCallback } from 'react'
import { type IconProps } from '@mui/material'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Icons } from '@masknet/icons'
import { useCopyToClipboard } from 'react-use'
import { usePopupCustomSnackbar } from '@masknet/theme'

export interface CopyIconButtonProps extends IconProps {
    text: string
}

export const CopyIconButton = memo<CopyIconButtonProps>(({ text, ...props }) => {
    const { t } = useI18N()
    const [, copyToClipboard] = useCopyToClipboard()
    const { showSnackbar } = usePopupCustomSnackbar()

    const onCopy = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            copyToClipboard(text)
            showSnackbar(t('copied'), {
                variant: 'success',
            })
        },
        [text, copyToClipboard],
    )

    return <Icons.PopupCopy onClick={onCopy} className={props.className} />
})
