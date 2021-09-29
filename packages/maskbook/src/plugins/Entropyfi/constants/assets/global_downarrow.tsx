import { SvgIcon, SvgIconProps } from '@material-ui/core'
import type { FC } from 'react'

export const DownarrowIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg viewBox="0 0 1024 1024">
            <path
                fill="#fff"
                d="M462 735 146 374a66 66 0 0 1 50-109h632a66 66 0 0 1 50 109L562 735a66 66 0 0 1-100 0z"
            />
        </svg>
    </SvgIcon>
)
