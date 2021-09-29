import { SvgIcon, SvgIconProps } from '@material-ui/core'
import type { FC } from 'react'

export const BtcIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg viewBox="0 0 32 32">
            <path fill="#fff" d="M0 16a16 16 0 1 1 32 0 16 16 0 0 1-32 0z" />
            <path fill="#F7931A" d="M32 20a16 16 0 1 1-32-8 16 16 0 0 1 32 8z" />
            <path
                fill="#fff"
                d="M23 14c0-2-1-4-3-4V7l-1-1-1 3a73 73 0 0 0-2 0l1-3h-2v2a58 58 0 0 1-1 0h-3v1l1 1 1 1-1 3-1 5H9l-1 2h2l1 1v3h1l1-3 1 1v2l2 1v-3c3 0 6 0 6-2 1-3 0-4-1-5l2-2zm-4 5c0 3-4 1-5 1l1-4c1 0 5 1 4 3zm1-5c-1 2-4 1-5 0l1-3c1 0 4 1 4 3z"
            />
        </svg>
    </SvgIcon>
)
