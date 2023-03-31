import { memo } from 'react'
import { Link } from '@mui/material'
import { Icons, type GeneratedIconProps } from '@masknet/icons'
import { useCopyToClipboard } from 'react-use'
import { useSharedI18N, useSnackbarCallback } from '../../../index.js'

export interface CopyIconLinkProps extends Omit<GeneratedIconProps, 'title'> {
    title?: string
    message?: string
    text: string
}

export const CopyButton = memo<CopyIconLinkProps>(({ text, message, title, ...props }) => {
    const t = useSharedI18N()
    const [, copyToClipboard] = useCopyToClipboard()

    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLAnchorElement>) => {
            ev.stopPropagation()
            ev.preventDefault()
            copyToClipboard(text)
        },
        [],
        undefined,
        undefined,
        undefined,
        message ?? t.copy_success_of_wallet_addr(),
    )
    return (
        <Link
            underline="none"
            component="button"
            title={title ?? t.wallet_status_button_copy_address()}
            onClick={onCopy}>
            <Icons.Copy {...props} />
        </Link>
    )
})

CopyButton.displayName = 'CopyButton'
