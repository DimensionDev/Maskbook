import { SvgIconProps, SvgIcon } from '@mui/material'

const svg = (
    <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#FEDA03" />
        <path
            d="M27.6 19.854c1.26-.328 2.382-1.27 2.382-3.165 0-3.155-2.679-3.889-6.111-3.889H10.2v14.206h5.754v-4.821h6.825c1.052 0 1.667.417 1.667 1.448v3.373H30.2v-3.551c0-1.935-1.091-3.155-2.6-3.601zm-4.722-1.498h-6.924v-1.39h6.924c.755 0 1.21.1 1.21.695s-.456.695-1.21.695z"
            fill="#000"
        />
    </svg>
)

export function RaribleIcon(props: SvgIconProps) {
    return <SvgIcon {...props}>{svg}</SvgIcon>
}
