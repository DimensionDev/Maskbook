import { memo } from 'react'
import { type IconProps, Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useCopyToClipboard } from 'react-use'
import { useSharedI18N, useSnackbarCallback } from '../../../index.js'

export interface CopyIconLinkProps extends IconProps {
    text: string
}

export const CopyIconLink = memo<CopyIconLinkProps>(({ text, ...props }) => {
    const t = useSharedI18N()
    const [, copyToClipboard] = useCopyToClipboard()

    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLAnchorElement>) => {
            ev.stopPropagation()
            copyToClipboard(text)
        },
        [],
        undefined,
        undefined,
        undefined,
        t.copy_success_of_wallet_addr(),
    )
    return (
        <Link underline="none" component="button" title={t.wallet_status_button_copy_address()} onClick={onCopy}>
            <Icons.Copy className={props.className} />
        </Link>
    )
})
