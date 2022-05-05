import { SvgIcon, SvgIconProps } from '@mui/material'

const svg = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#1D9BF0" />
        <path
            d="M6.19922 12.757L10.1992 16.957L18.1992 8.55701"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const SelectedIcon = (props: SvgIconProps) => <SvgIcon {...props}>{svg}</SvgIcon>
