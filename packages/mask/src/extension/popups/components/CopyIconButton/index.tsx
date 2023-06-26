// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { Icons, type GeneratedIconProps } from '@masknet/icons'
import { usePopupCustomSnackbar } from '@masknet/theme'
import { memo, useCallback } from 'react'
import { useCopyToClipboard } from 'react-use'
import { useI18N } from '../../../../utils/i18n-next-ui.js'

export interface CopyIconButtonProps extends GeneratedIconProps {
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

    return <Icons.PopupCopy onClick={onCopy} {...props} />
})
