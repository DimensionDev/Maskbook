import { SvgIconProps, SvgIcon } from '@mui/material'

const svg = (
    <svg width="100%" height="100%" viewBox="0 0 23 35" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.141 0L18.4212 4.71191L10.141 9.42385L1.86084 4.71191L10.141 0ZM20.2617 7.49663V16.9245L11.8183 21.7249V12.3011L20.2617 7.49663ZM23 19.2225L11.8183 25.5721V35L23 28.6504V19.2225ZM0 16.9203V7.4965L8.43932 12.301V21.7248L0 16.9203ZM0 20.7664V30.1942L8.43932 34.9947V25.5709L0 20.7664Z"
        />
    </svg>
)

export function BancorIcon(props: SvgIconProps) {
    return <SvgIcon {...props}>{svg}</SvgIcon>
}
