import { SvgIcon, SvgIconProps } from '@material-ui/core'
import type { FC } from 'react'

export const DownarrowIcon: FC<SvgIconProps> = (props) => (
    <SvgIcon {...props}>
        <svg viewBox="0 0 1024 1024">
            <path
                fill="#fff"
                d="M462.364 735.462L146.22 374.166a65.918 65.918 0 0 1 49.636-109.358h632.286a65.918 65.918 0 0 1 49.636 109.358l-316.143 361.23a65.918 65.918 0 0 1-99.272 0z"
            />
        </svg>
    </SvgIcon>
)
