import { SvgIcon, SvgIconProps } from '@mui/material'

const svg = (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M4.6001 8.29999C6.5331 8.29999 8.1001 6.73298 8.1001 4.79999C8.1001 2.86699 6.5331 1.29999 4.6001 1.29999C2.6671 1.29999 1.1001 2.86699 1.1001 4.79999C1.1001 6.73298 2.6671 8.29999 4.6001 8.29999Z"
            fill="#3DC233"
            stroke="white"
        />
    </svg>
)

export const PointIcon = (props: SvgIconProps) => <SvgIcon {...props}>{svg}</SvgIcon>
