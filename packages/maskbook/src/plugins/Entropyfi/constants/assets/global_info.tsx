import { SvgIcon, SvgIconProps } from '@material-ui/core'
import type { FC } from 'react'

export const InfoIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg fill="none" viewBox="0 0 14 14">
            <path
                fill="#F4F5F6"
                fill-rule="evenodd"
                d="M14 7A7 7 0 1 1 0 7a7 7 0 0 1 14 0zm-8.4.7a1.4 1.4 0 1 1 2.8 0v2.8a1.4 1.4 0 1 1-2.8 0V7.7zM7 2.1a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"
                clip-rule="evenodd"
            />
        </svg>
    </SvgIcon>
)
