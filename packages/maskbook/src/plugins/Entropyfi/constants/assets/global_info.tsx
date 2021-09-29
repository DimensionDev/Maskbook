import { SvgIcon, SvgIconProps } from '@material-ui/core'
import type { FC } from 'react'

export const InfoIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg fill="none" viewBox="0 0 14 14">
            <path
                fill="#F4F5F6"
                d="M14 7A7 7 0 1 1 0 7a7 7 0 0 1 14 0zM6 8a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0V8zm1-6a1 1 0 1 0 0 3 1 1 0 0 0 0-3z"
            />
        </svg>
    </SvgIcon>
)
