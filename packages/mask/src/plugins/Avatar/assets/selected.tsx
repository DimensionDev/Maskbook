import { SvgIcon, SvgIconProps } from '@mui/material'

const svg = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#3DC233" />
        <path
            d="M7 12.5L10.3333 16L17 9"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const SelectedIcon = (props: SvgIconProps) => <SvgIcon {...props}>{svg}</SvgIcon>
