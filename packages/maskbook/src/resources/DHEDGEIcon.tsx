import { SvgIcon, SvgIconProps } from '@material-ui/core'
import type { FC } from 'react'

export const DHEDGEIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M5.065 7.89L2.678 9.01v5.87l2.387-1.071V7.89zM9.205 1.12L6.818 2.214v10.912l2.387-1.023V1.119zM11.032 12.688V5.771l2.29 1.17v7.038l-2.29-1.29z"
                fill="#0096CA"
            />
        </svg>
    </SvgIcon>
)
