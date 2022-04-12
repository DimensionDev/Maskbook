import { SvgIcon, SvgIconProps } from '@mui/material'

const svg = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.43427 19.5657C8.12185 19.2533 8.12185 18.7468 8.43427 18.4344L14.8686 12L8.43427 5.56573C8.12185 5.25331 8.12185 4.74678 8.43427 4.43436C8.74668 4.12194 9.25322 4.12194 9.56564 4.43436L16.5656 11.4344C16.8781 11.7468 16.8781 12.2533 16.5656 12.5657L9.56564 19.5657C9.25322 19.8782 8.74669 19.8782 8.43427 19.5657Z"
            fill="#536471"
        />
    </svg>
)

export const MoreIcon = (props: SvgIconProps) => <SvgIcon {...props}>{svg}</SvgIcon>
